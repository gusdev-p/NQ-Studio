export class FileBar {
    private root: HTMLElement

    private fileBar: HTMLDivElement;
    
    constructor(root: HTMLElement) {
        this.root = root;

        const fileBar = document.createElement("div");
        fileBar.id = "fileBar";
        fileBar.style.width = "calc(100% - 10px)";
        fileBar.style.display = "flex";
        fileBar.style.boxSizing = "border-box";
        fileBar.style.justifyContent = "space-around";
        fileBar.style.alignItems = "center";
        fileBar.style.height = "50px";
        fileBar.style.background = "var(--surfaceColor)";
        fileBar.style.borderRadius = "8px";
        fileBar.style.margin = "0 5px"
        fileBar.style.border = "1px solid var(--borderColor)";

        this.fileBar = fileBar

        root.appendChild(fileBar);
    }

    appendFile(config: any) {
        this.fileBar.replaceChildren()

        const section = document.createElement("div");
        section.id = "fileSection"
        section.style.background = "var(--onSurfaceColor)";
        section.style.display = "flex";
        section.style.justifyContent = "center";
        section.style.alignItems = "center";
        section.style.borderRadius = "10px";
        section.style.padding = "5px";
        section.style.gap = "5px";

        const title = document.createElement("label");
        title.style.color = "var(--fontColor)"
        title.innerText = config.fileName;

        const type = config.fileType;

        const runButton = document.createElement("button");
        runButton.style.backgroundColor = "var(--surfaceColor)";
        runButton.style.border = "none";
        runButton.style.borderRadius = "8px";
        runButton.style.padding = "5px";
        runButton.style.color = "var(--fontColor)";
        console.log("checando...")
        console.log(`'${type}'`)
        console.log("file path:", config.filePath)

        section.appendChild(title);
        
        switch(type) {
            case ".js": {
                console.log("é js!")
                runButton.innerText = "▶";
                runButton.onclick = async () => {
                    console.log(`${await window.nq.getRoot()}/.nq/nq-runner`)
                    if (await window.nq.exists(`${await window.nq.getRoot()}/.nq/nq-runner`)) {
                        console.log("achei!")
                        window.terminal.executeInTerminal(`${await window.nq.getRoot()}/.nq/nq-runner ${config.filePath}`);
                    } else {
                        console.log("n deu ent :/")
                        window.terminal.executeInTerminal(`node ${config.filePath} && echo "--- Exited with exit code: $?"`);
                    }
                }
                section.appendChild(runButton);
                break;
            }
            case ".html": {
                console.log("é html!")
                runButton.innerText = "Preview.";
                runButton.onclick = async () => {
                    document.dispatchEvent(new CustomEvent("htmlPreview", {
                        detail: {
                            path: config.filePath
                        }
                    }));
                }
                const secondaryRunButton = document.createElement("button");
                secondaryRunButton.style.backgroundColor = "var(--surfaceColor)";
                secondaryRunButton.style.border = "none";
                secondaryRunButton.style.borderRadius = "8px";
                secondaryRunButton.style.padding = "5px";
                secondaryRunButton.style.color = "var(--fontColor)";

                secondaryRunButton.innerText = "Preview in server.";
                secondaryRunButton.onclick = () => {
                    document.dispatchEvent(new CustomEvent("server:htmlPreview", {
                        detail: {
                            path: config.filePath
                        }
                    }));
                }

                const tertiaryRunButton = document.createElement("button");
                tertiaryRunButton.style.backgroundColor = "var(--surfaceColor)";
                tertiaryRunButton.style.border = "none";
                tertiaryRunButton.style.borderRadius = "8px";
                tertiaryRunButton.style.padding = "5px";
                tertiaryRunButton.style.color = "var(--fontColor)";

                tertiaryRunButton.innerText = "Preview in browser.";
                tertiaryRunButton.onclick = () => {
                    document.dispatchEvent(new CustomEvent("server:openInBrowser", {
                        detail: {
                            path: config.filePath
                        }
                    }));
                }

                section.appendChild(runButton);
                section.appendChild(secondaryRunButton);
                section.appendChild(tertiaryRunButton);
                break;
            };
            case ".md": {
                console.log("é md!")
                runButton.innerText = "Preview.";
                runButton.onclick = async () => {
                    document.dispatchEvent(new CustomEvent("markdownPreview", {
                        detail: {
                            path: config.filePath,
                        },
                    }));
                }
                section.appendChild(runButton);
                break;
            }
        }


        this.fileBar.appendChild(section);
    }
}