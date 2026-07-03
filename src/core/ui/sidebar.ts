import { makeTreeNodes, TreeNode } from "./treeView/treeProvider.js";
import { treeView, treeItem } from "./treeView/treeRender.js";

export class SideBar {
    private root: HTMLElement;
    private maxWidth = window.innerWidth * 0.5;
    private minWidth = 150;

    private sidebar: HTMLDivElement;
    private resizer: HTMLDivElement;
    private wrapper: HTMLDivElement;

    public content: HTMLDivElement;

    constructor (root: HTMLElement) {
        this.root = root;

        this.sidebar = document.createElement("div");
        this.sidebar.id = "sidebar";
        this.sidebar.style.height = "calc(100vh - 10px)";
        this.sidebar.style.width = "300px";
        this.sidebar.style.display = "flex";
        this.sidebar.style.flexDirection = "row";
        this.sidebar.style.flexShrink = "0";
        this.sidebar.style.background = "var(--surfaceColor, #3c3c3c)";
        this.sidebar.style.overflow = "hidden";


        this.resizer = document.createElement("div");
        this.resizer.id = "resizer";
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
        this.wrapper.id = "wrapper"
        this.wrapper.style.display = "flex";
        this.wrapper.style.height = "calc(100vh - 10px)";
        this.wrapper.style.flexShrink = "0";
        this.wrapper.style.borderRadius = "10px";
        this.wrapper.style.margin = "0 8px 0 8px";
        this.wrapper.style.overflow = "hidden";
        
        this.content = document.createElement("div");
        this.content.id = "content";
        this.content.style.flex = "1";
        this.content.style.overflowY = "auto";
        this.content.style.minHeight = "0";

        this.sidebar.appendChild(this.content);

        this.wrapper.appendChild(this.sidebar);
        //this.wrapper.appendChild(this.resizer);

        this.root.appendChild(this.wrapper);
        this.root.appendChild(this.resizer);
    }

    async defineTreeView(tree: string) {
        this.content.innerHTML = "";
        this.content.style.boxSizing = "border-box";
        this.content.style.padding = "8px 5px 8px 5px";
        
        const src = await window.nq.getTree(tree);
        const topBar = document.createElement("div");
        topBar.style.width = "100%";
        topBar.style.margin = "0 0 5px 0";
        topBar.style.gap = "2px";
        topBar.style.display = "flex";

        const createDirBtn = document.createElement("button");
        createDirBtn.innerText = "Create Directory";
        const createFileBtn = document.createElement("button");
        createFileBtn.innerText = "CreateFile";

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
}