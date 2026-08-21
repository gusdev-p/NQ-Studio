import { treeView } from "./treeView/treeRender.js";

export class SideBar {
    private root: HTMLElement;
    private maxWidth = window.innerWidth * 0.3;
    private minWidth = 150;

    private sidebar: HTMLDivElement;
    private resizer: HTMLDivElement;
    private wrapper: HTMLDivElement;

    public content: HTMLDivElement;

    constructor (root: HTMLElement) {
        this.root = root;

        this.sidebar = document.createElement("div");
        this.sidebar.id = "sideBar";
        this.sidebar.style.height = "calc(100vh - 10px)";
        this.sidebar.style.width = "300px";
        this.sidebar.style.display = "flex";
        this.sidebar.style.flexDirection = "row";
        this.sidebar.style.flexShrink = "0";
        this.sidebar.style.background = "var(--surfaceColor, #3c3c3c)";
        this.sidebar.style.borderRadius = "10px";


        this.resizer = document.createElement("div");
        this.resizer.id = "sideBarResizer";
        this.resizer.style.background = "var(--borderColor, #3c3c3c)";
        this.resizer.style.cursor = "col-resize"
        this.resizer.style.width = "4.5px";
        this.resizer.style.height = "calc(100vh - 10px)";
        this.resizer.style.borderRadius = "100px";
        this.resizer.style.transition = "all 0.2s ease-in";

        this.resizer.addEventListener("mousedown", (e) => {
            e.preventDefault();
            document.body.style.cursor = "col-resize"
            this.resizer.style.background = "var(--accentColor, #1e8ed3)";
            this.resizer.style.borderRadius = "100%";
            const sidebarRect = this.sidebar.getBoundingClientRect();

            const startX = e!.clientX;
            const startWidth = sidebarRect.width;

            const move = (e: MouseEvent) => {
                const delta = e.clientX - startX;

                const newWidth = Math.min(
                    this.maxWidth,
                    Math.max(this.minWidth, startWidth + delta)
                );


                this.sidebar.style.width = `${newWidth}px`;
            }

            const stop = () => {
                document.removeEventListener("mousemove", move);
                document.removeEventListener("mouseup", stop);
                document.body.style.userSelect = "";
                document.body.style.cursor = "";
                this.resizer.style.background = "var(--borderColor, #3c3c3c)";
                this.resizer.style.borderRadius = "100px";
            }

            document.addEventListener("mousemove", move);
            document.addEventListener("mouseup", stop);
        })

        this.wrapper = document.createElement("div");
        this.wrapper.id = "sideBarWrapper"
        this.wrapper.style.display = "flex";
        this.wrapper.style.flexShrink = "0";
        this.wrapper.style.margin = "0 8px 0 8px";
        this.wrapper.style.gap = "4px";
        
        this.content = document.createElement("div");
        this.content.id = "content";
        this.content.style.flex = "1";
        this.content.style.overflowY = "auto";
        this.content.style.minHeight = "0";

        this.sidebar.appendChild(this.content);

        this.wrapper.appendChild(this.sidebar);
        this.wrapper.appendChild(this.resizer);

        this.root.appendChild(this.wrapper);
    }

    /**
     * 
     * @param tree 
     */
    async defineTreeView(tree: string) {
        this.content.innerHTML = "";
        this.content.id = "TreeView";
        this.content.style.boxSizing = "border-box";
        this.content.style.padding = "8px 5px 8px 5px";
        this.content.style.gap = "0";
        
        const src = await window.nq.getTree(tree);
        const topBar = document.createElement("div");
        topBar.style.width = "100%";
        topBar.style.margin = "0 0 5px 0";
        topBar.style.gap = "5px";
        topBar.style.display = "flex";

        const createDirBtn = document.createElement("button");
        createDirBtn.innerText = "Create Directory";
        createDirBtn.style.background = "var(--onSurfaceColor)";
        createDirBtn.style.color = "var(--fontColor)";
        createDirBtn.style.border = "none";
        createDirBtn.style.borderRadius = "8px";
        createDirBtn.style.padding = "3px 5px";
        createDirBtn.style.cursor = "pointer";
        const createFileBtn = document.createElement("button");
        createFileBtn.innerText = "CreateFile";
        createFileBtn.style.background = "var(--onSurfaceColor)";
        createFileBtn.style.color = "var(--fontColor)";
        createFileBtn.style.border = "none";
        createFileBtn.style.borderRadius = "8px";
        createFileBtn.style.padding = "3px 5px";
        createFileBtn.style.cursor = "pointer";

        createDirBtn.addEventListener("click", async () => {
            const result = await window.nq.ask("Create directory" ,"Enter Directory name:");
            if (result === null) return
            document.dispatchEvent(new CustomEvent("createDir", {
                detail: {
                    name: result,
                },
            }));
        });

        createFileBtn.addEventListener("click", async () => {
            const result = await window.nq.ask("Create file", "Enter file name:");
            if (result === null) return
            document.dispatchEvent(new CustomEvent("createFile", {
                detail: {
                    name: result,
                },
            }));
        });

        topBar.appendChild(createDirBtn);
        topBar.appendChild(createFileBtn);


        this.content.appendChild(topBar);

        new treeView(this.content, src);
    }

    async defineMakefileView(parsedResult : {
        functions: {
        value: string | undefined;
        line: number;
        }[];
        variables: {
        name: string | undefined;
        value: string | undefined;
        line: number;
        }[];
        commentaries: {
        value: string;
        line: number;
        }[];
        calls: {
        value: string;
        line: number;
        }[];
        path: string;
    }) {
        this.content.innerHTML = "";
        this.content.id = "MakefileView";
        this.content.style.boxSizing = "border-box";
        this.content.style.padding = "8px 5px 8px 5px";
        this.content.style.display = "flex";
        this.content.style.flexDirection = "column";
        this.content.style.gap = "13px";

        const functions = document.createElement("div");
        functions.id = "functions";
        functions.style.display = "flex";
        functions.style.flexDirection = "column";
        functions.style.gap = "8px";
        functions.style.background = "var(--onSurfaceColor)";
        functions.style.borderRadius = "8px";
        functions.style.overflow = "hidden";
        functions.style.boxSizing = "border-box";
        functions.style.padding = "5px"

        const functionsTitle = document.createElement("div");
        functionsTitle.style.width = "100%";
        functionsTitle.innerText = "Targets or Rules.";
        functionsTitle.style.color = "var(--fontColor)";
        functionsTitle.style.borderBottom = "2px solid var(--borderColor)";
        functionsTitle.style.fontWeight = "bold";

        functions.appendChild(functionsTitle);

        let count = 0;
        for (const functionOption of parsedResult.functions) {
            const functionDiv = document.createElement("div");
            functionDiv.style.color = "var(--fontColor)";
            functionDiv.style.background = "var(--onSurfaceColor)";
            functionDiv.style.border = "none";
            functionDiv.style.textAlign = "left";
            functionDiv.id = `function-${count}`;
            functionDiv.style.cursor = "pointer";
            functionDiv.style.display = "flex";
            functionDiv.style.justifyContent = "space-between";
            functionDiv.style.borderRadius = "6px";
            functionDiv.style.boxSizing = "border-box";
            functionDiv.style.padding = "0 3px";
            
            const functionTitle = document.createElement("label");
            functionTitle.innerText = `${functionOption.value}`;
            functionTitle.style.color = "var(--fontColor)";

            const functionLine = document.createElement("label");
            functionLine.innerText = `Line: ${functionOption.line}`;
            functionLine.style.color = "var(--fontColor)";

            functionDiv.appendChild(functionTitle);
            functionDiv.appendChild(functionLine);

            functionDiv.addEventListener("mouseenter", () => {
                functionDiv.style.background = "var(--surfaceColor)";
                functionTitle.innerText = `${functionOption.value}`;
                functionTitle.style.fontWeight = "bold";
            });

            functionLine.addEventListener("mouseenter", () => {
                functionLine.style.fontWeight = "bold";
                functionTitle.style.fontWeight = "";
            });

            functionLine.addEventListener("mouseleave", () => {
                functionLine.style.fontWeight = "";
            });

            functionDiv.addEventListener("mouseleave", () => {
                functionDiv.style.background = "var(--onSurfaceColor)";
                functionTitle.innerText = `${functionOption.value}`;
                functionTitle.style.fontWeight = "";
            });

            functionDiv.addEventListener("click", async () => {
                await window.nq.getLocalProperty("makefile") === undefined
                    ? window.terminal.executeInTerminal(`make ${functionOption.value}`)
                    : window.terminal.executeInTerminal(`make -f ${await window.nq.getLocalProperty("makefile")} ${functionOption.value}`);
            });

            functionTitle.addEventListener("click", () => {
                
            });

            functions.appendChild(functionDiv);
            count += 1;
        }
        
        this.content.appendChild(functions);
    }
}