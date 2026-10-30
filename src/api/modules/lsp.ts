import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { pathToFileURL, fileURLToPath } from "url";
import { BrowserWindow } from "electron";

type LSPType = "typescript" | "html" | "css" | "json";

export class LSP {
    private servers = new Map<LSPType, ChildProcessWithoutNullStreams>();
    private buffers = new Map<LSPType, Buffer>();
    private pendingRequests = new Map<number, (result: any) => void>();
    private initializationPromises = new Map<LSPType, Promise<void>>();
    private initializationResolvers = new Map<LSPType, {
        resolve: () => void;
        reject: (error: Error) => void;
    }>();
    private requestId = 2;
    private win: BrowserWindow | null = null;

    constructor (private verbose: boolean) {}
    
    start(win: BrowserWindow, type: LSPType = "typescript", root: string) {
        if (this.servers.has(type)) {
            if (this.verbose) console.log(`[LSP]: ${type} already running...`);
            return;
        }

        this.win = win;
        this.buffers.set(type, Buffer.alloc(0));

        const { command, args } = this.getCommand(type);

        if (this.verbose) console.log(`[LSP]: Starting ${type} Language Server...`);

        const server = spawn(command, args, {stdio: ["pipe", "pipe", "pipe"]});

        this.servers.set(type, server);

        let resolveInitialization!: () => void;
        let rejectInitialization!: (error: Error) => void;
        const initialization = new Promise<void>((resolve, reject) => {
            resolveInitialization = resolve;
            rejectInitialization = reject;
        });
        void initialization.catch(() => {});
        this.initializationPromises.set(type, initialization);
        this.initializationResolvers.set(type, {
            resolve: resolveInitialization,
            reject: rejectInitialization
        });

        server.on("exit", (code, signal) => {
            if (this.verbose) console.log(`[LSP]: ${type} exited, code=${code} signal${signal}`);

            if (this.servers.get(type) === server) {
                this.initializationResolvers.get(type)?.reject(
                    new Error(`[LSP ${type}]: Server exited before initialization completed`)
                );
                this.initializationResolvers.delete(type);
                this.initializationPromises.delete(type);
                this.servers.delete(type);
                this.buffers.delete(type);
            }
        });

        server.on("error", error => {
            console.error(`[LSP ${type}]: Spawn error:`, error);
            this.initializationResolvers.get(type)?.reject(error);
            this.initializationResolvers.delete(type);
        })

        server.stdout.on("data", data => {
            this.handleData(type, data);
        });

        server.stderr.on("data", data => {
            if (this.verbose) console.log(`[LSP ${type} ERROR]:`, data.toString());
        });

        const rootAsUri = pathToFileURL(root).toString();

        this.send(type, {
            jsonrpc: "2.0",
            id: 1,
            method: "initialize",
            params: {
                processId: process.pid,
                rootUri: rootAsUri,
                initializationOptions: {
                    provideFormatter: true
                },
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
        
        if (this.verbose) console.log(`[LSP]: ${type} started!`);
    }

    stop(type: LSPType = "typescript") {
        const server = this.servers.get(type);

        if (!server) {
            if (this.verbose) console.warn(`[LSP ${type}]: No LSP server initialized!`);
            return;
        }

        server?.kill();
        this.initializationResolvers.get(type)?.reject(
            new Error(`[LSP ${type}]: Server stopped before initialization completed`)
        );
        this.initializationResolvers.delete(type);
        this.initializationPromises.delete(type);
        this.servers.delete(type);
        this.buffers.delete(type);

        if (this.verbose) console.log(`[LSP ${type}]: LSP server killed!`);
    }

    async hover(path: string, line: number, character: number, type: LSPType = "typescript") {
        await this.waitUntilInitialized(type);

        const uri = pathToFileURL(path).toString();
        
        return await this.request(type,
            "textDocument/hover",
            {
                textDocument: {
                    uri
                },
                position: {
                    line,
                    character
                }
            }
        );
    }

    async switchTo(win: BrowserWindow, type: LSPType, root: string) {
        for (const [serverType, server] of this.servers) {
            if (serverType === type) continue;

            server.kill();
            this.initializationResolvers.get(serverType)?.reject(
                new Error(`[LSP ${serverType}]: Server stopped before initialization completed`)
            );
            this.initializationResolvers.delete(serverType);
            this.initializationPromises.delete(serverType);
            this.servers.delete(serverType);
            this.buffers.delete(serverType);
        }

        if (!this.servers.has(type)) {
            this.start(win, type, root);
        }

        await this.waitUntilInitialized(type);
    }

    async definition(path: string, line: number, character: number, type: LSPType = "typescript") {
        await this.waitUntilInitialized(type);

        return this.request(type, "textDocument/definition", {
            textDocument: {
                uri: pathToFileURL(path).toString()
            },
            position: {
                line,
                character
            }
        });
    }

    private async waitUntilInitialized(type: LSPType) {
        const initialization = this.initializationPromises.get(type);

        if (!initialization) {
            throw new Error(`[LSP ${type}]: Server has not been started`);
        }

        await initialization;
    }

    private getCommand(type: LSPType) {
        switch (type) {
            case "typescript": {
                return {
                    command: "npx",
                    args: ["typescript-language-server", "--stdio"]
                };
            }

            case "html": {
                return {
                    command: "npx",
                    args: [
                        "--no-install",
                        "vscode-html-language-server",
                        "--stdio"
                    ]
                };
            }

            case "css": {
                return {
                    command: "npx",
                    args: [
                        "--no-install",
                        "vscode-css-language-server",
                        "--stdio"
                    ]
                };
            }
            
            case "json": {
                return {
                    command: "npx",
                    args: [
                        "--no-install",
                        "vscode-json-language-server",
                        "--stdio"
                    ]
                }
            }
        }
    }

    private send(type: LSPType, message: object) {
        const server = this.servers.get(type);

        if (!server || server.killed) {
            console.error(`[LSP ${type}]: Server is not running!`);
            return;
        }

        const json = JSON.stringify(message);

        const packet = `Content-Length: ${Buffer.byteLength(json)}\r\n\r\n${json}`;

        server.stdin.write(packet);
    }

    private handleData(type: LSPType, data: Buffer) {
        if (this.verbose) console.log(`[LSP ${type}]: Received ${data.length} bytes`)
        let buffer = Buffer.concat([
            this.buffers.get(type) ?? Buffer.alloc(0),
            data
        ]);

        while (true) {
            const separator = Buffer.from("\r\n\r\n");
            const headerEnd = buffer.indexOf(separator);

            if (headerEnd === -1) break;

            const header = buffer.subarray(0, headerEnd).toString("ascii");
            if (this.verbose) console.log(`[LSP ${type}]: Header:`, JSON.stringify(header));
            const match = header.match(/Content-Length:\s*(\d+)/i);

            if (!match) {
                buffer = buffer.subarray(headerEnd + separator.length);
                continue;
            }

            const contentLength = Number(match[1]);
            const bodyStart = headerEnd + separator.length;
            const bodyEnd = bodyStart + contentLength;

            if (buffer.length < bodyEnd) {
                if (this.verbose) console.log(`[LSP ${type}]: Incomplete message`, {
                    expected: contentLength, received: buffer.length - bodyStart
                });
                break;
            };

            const body = buffer.subarray(bodyStart, bodyEnd).toString("utf-8");
            buffer = buffer.subarray(bodyEnd);

            try {
                const message = JSON.parse(body);

                if (this.verbose) console.log(`[LSP ${type}]: Message?:`, {
                    id: message.id,
                    method: message.method,
                    hasResult: message.result !== undefined,
                    error: message.error
                });

                this.handleMessage(type, message);
            } catch (e) {
                if (this.verbose) console.log(`[LSP ${type}]: Invalid JSON:`, e);
            }
        }

        this.buffers.set(type, buffer);
    }

    private handleMessage(type: LSPType, message: any) {
        if (message.id !== undefined && this.pendingRequests.has(message.id)) {
            const resolve = this.pendingRequests.get(message.id)!;

            this.pendingRequests.delete(message.id);

            if (message.error) {
                console.error(`[LSP ${type}]: Request error:`, message.error);
                resolve(null);
            } else {
                resolve(message.result);
            }

            return;
        }

        if (message.method === "textDocument/publishDiagnostics") {
            const { uri, diagnostics } = message.params;

            this.win?.webContents.send(
                "lsp:diagnostics",
                uri,
                diagnostics
            );
        }

        if (message.id === 1) {
            const initialization = this.initializationResolvers.get(type);

            if (message.error) {
                initialization?.reject(
                    new Error(message.error.message ?? JSON.stringify(message.error))
                );
            } else if (message.result) {
                if (this.verbose) console.log(`[LSP ${type}]: Initialize completed!`)
                this.send(type, {
                    jsonrpc: "2.0",
                    method: "initialized",
                    params: {}
                });
                initialization?.resolve();
            }

            this.initializationResolvers.delete(type);
        }
    }

    async completion(path: string, line: number, character: number, type: LSPType = "typescript") {
        await this.waitUntilInitialized(type);

        const uri = pathToFileURL(path).toString();

        if (this.verbose) console.log(`[LSP ${type}]: Requesting completion:`, {
            uri,
            line,
            character
        });

        const result = await this.request(type,
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

        if (this.verbose) console.log(`[LSP ${type}]: Completion result:`, JSON.stringify(result, null, 2));
        return result;
    }

    openFile(path: string, text: string, languageId: string, type: LSPType = "typescript") {
        if (this.verbose) console.log(`[LSP ${type}]: Opening ${path} as ${languageId}...`);
        const uri = pathToFileURL(path).toString();

        this.send(type, {
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

    changeFile(path: string, version: number, text:string, type: LSPType = "typescript") {
        void this.waitUntilInitialized(type).then(() => {
            const uri = pathToFileURL(path).toString();

            this.send(type, {
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
        }).catch(error => {
            console.error(`[LSP ${type}]: Failed to send document changes:`, error);
        });
    }

    private request(type: LSPType, method: string, params: any): Promise<any> {
        return new Promise(resolve => {
            const id = this.requestId++;

            this.pendingRequests.set(id, resolve);

            if (this.verbose) console.log(`[LSP ${type}]: -> Request`, {id, method});

            this.send(type, {
                jsonrpc: "2.0",
                id,
                method,
                params
            });
        });
    }
}