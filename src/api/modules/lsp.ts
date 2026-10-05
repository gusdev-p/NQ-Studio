import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { pathToFileURL } from "url";
import { BrowserWindow } from "electron";

export class LSP {
    private server: ChildProcessWithoutNullStreams | null = null;
    private buffer = Buffer.alloc(0);
    private win: BrowserWindow | null = null;
    private requestId = 2;
    private pendingRequests = new Map<number, (result: any) => void>();

    start(win: BrowserWindow) {
        if (this.server) {
            console.log("[LSP]: Already running...");
            return;
        }

        this.win = win;

        console.log("[LSP]: Starting TypeScript Language Server...");

        this.server = spawn(
            "npx",
            ["typescript-language-server", "--stdio"],
            {
                stdio: ["pipe", "pipe", "pipe"]
            }
        );

        this.server.on("exit", (code, signal) => {
            console.log(`[LSP]: Server exited, code=${code} signal=${signal}`);
            this.server = null;
        });

        this.server.stdout.on("data", data => {
            console.log("[LSP RAW]:", data.toString());
            this.handleData(data);
        });

        this.server.stderr.on("data", data => {
            console.log("[LSP RAW STDERR]:", data.toString());
        });

        this.send({
            jsonrpc: "2.0",
            id: 1,
            method: "initialize",
            params: {
                processId: process.pid,
                rootUri: null,
                capabilities: {
                    textDocument: {
                        synchronization: {
                            dynamicRegistration: false
                        },

                        completion: {
                            completionItem: {
                                snippetSupport: true
                            }
                        },

                        hover: {},
                        definition: {},
                        publishDiagnostics: {}
                    }
                }
            }
        });

        
        console.log("[LSP]: Sever started!");
    }

    stop() {
        if (!this.server) {
            return;
        }

        this.server.kill();
        this.server = null;

        console.log("[LSP]: Server stopped.");
    }

    private send(message: object) {
        if (!this.server) {
            console.error("[LSP]: Cannot send... The server is not running!");
            return;
        }

        const json = JSON.stringify(message);

        console.log("[LSP SEND]:", message);

        const packet = `Content-Length: ${Buffer.byteLength(json)}\r\n\r\n${json}`;

        this.server.stdin.write(packet);
    }

    private handleData(data: Buffer) {
        this.buffer = Buffer.concat([
            this.buffer,
            data
        ]);

        while (true) {
            const separator = Buffer.from("\r\n\r\n");

            const headerEnd = this.buffer.indexOf(separator);

            if (headerEnd === -1) {
                return;
            }

            const header = this.buffer
                .subarray(0, headerEnd)
                .toString("ascii");

            const match = header.match(
                /Content-Length:\s*(\d+)/i
            );

            if (!match) {
                console.error("[LSP]: Invalid header:");
                console.error(header);

                this.buffer = this.buffer.subarray(
                    headerEnd + separator.length
                );

                continue;
            }

            const contentLength = Number(match[1]);

            const bodyStart = headerEnd + separator.length;
            const bodyEnd = bodyStart + contentLength;

            console.log("[LSP PARSER]", {
                bufferSize: this.buffer.length,
                headerEnd,
                contentLength,
                bodyStart,
                bodyEnd,
                available: this.buffer.length - bodyStart
            });

            // A mensagem ainda não chegou inteira.
            if (this.buffer.length < bodyEnd) {
                console.log("[LSP]: Waiting for more data...");
                return;
            }

            const bodyBuffer = this.buffer.subarray(
                bodyStart,
                bodyEnd
            );

            const body = bodyBuffer.toString("utf8");

            // Remove a mensagem já processada.
            this.buffer = this.buffer.subarray(bodyEnd);

            try {
                const message = JSON.parse(body);

                console.log("[LSP RECEIVED]:", message);

                this.handleMessage(message);
            } catch (error) {
                console.error(
                    "[LSP]: Failed to parse JSON:",
                    error
                );

                console.error(
                    "[LSP]: Content-Length:",
                    contentLength
                );

                console.error(
                    "[LSP]: Actual bytes:",
                    bodyBuffer.length
                );

                console.error(
                    "[LSP]: Body start:",
                    body.slice(0, 200)
                );

                console.error(
                    "[LSP]: Body end:",
                    body.slice(-200)
                );
            }
        }
    }

    private handleMessage(message: any) {
        console.log("[LSP]", message);

        if (message.id !== undefined && this.pendingRequests.has(message.id)) {
            const resolve = this.pendingRequests.get(message.id)!

            this.pendingRequests.delete(message.id);

            resolve(message.result);

            return;
        }

        if (message.method === "textDocument/publishDiagnostics") {
            const { uri, diagnostics } = message.params;

            console.log("[LSP]: diagnostics:", diagnostics);

            this.win?.webContents.send("lsp:diagnostics", uri, diagnostics);
        }

        if (message.id === 1 && message.result) {
            console.log("[LSP]: Initialized!");

            this.send({
                jsonrpc: "2.0",
                method: "initialized",
                params: {}
            });

            return;
        }
    }

    async completion(path: string, line: number, character: number) {
        const uri = pathToFileURL(path).toString();

        return await this.request(
            "textDocument/completion",
            {
                textDocument: {
                    uri
                },
                position: {
                    line,
                    character
                },
                context: {
                    triggerKind: 1
                }
            }
        );
    }

    openFile(path: string, text: string, languageId: string){
        const uri = pathToFileURL(path).toString();

        this.send({
            jsonrpc: "2.0",
            method: "textDocument/didOpen",

            params: {
                textDocument: {
                    uri,
                    languageId,
                    version: 1,
                    text
                }
            }
        });
    }

    changeFile(path: string, version: number, text:string) {
        const uri = pathToFileURL(path).toString();

        this.send({
            jsonrpc: "2.0",
            method: "textDocument/didChange",

            params: {
                textDocument: {
                    uri,
                    version
                },

                contentChanges: [
                    {
                        text
                    }
                ]
            }
        });
    }

    private request(method: string, params: any): Promise<any> {
        return new Promise((resolve) => {
            const id = this.requestId++;

            this.pendingRequests.set(id, resolve);

            this.send({
                jsonrpc: "2.0",
                id,
                method,
                params
            })
        })
    }
}