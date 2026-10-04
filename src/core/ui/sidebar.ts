import { defineTreeView } from "./sidebar-ui/treeView.js";
import { defineMakefileView } from "./sidebar-ui/makefile.js";

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
        this.sidebar.style.background = "var(--surfaceColor)";

        this.resizer = document.createElement("div");
        this.resizer.id = "sideBarResizer";
        this.resizer.style.background = "var(--surfaceColor)";
        this.resizer.style.cursor = "col-resize"
        this.resizer.style.width = "4.5px";
        this.resizer.style.height = "100%";
        this.resizer.style.transition = "all 0.2s ease-in";
        this.resizer.style.color = "var(--fontColor)";
        this.resizer.style.display = "flex";
        this.resizer.style.justifyContent = "center";
        this.resizer.style.alignItems = "center";

        const resizerText = document.createElement("div");
        resizerText.innerText = "⋮"

        this.resizer.appendChild(resizerText);

        this.resizer.addEventListener("mousedown", (e) => {
            e.preventDefault();
            document.body.style.cursor = "col-resize"
            this.resizer.style.background = "var(--accentColor)";
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
                this.resizer.style.background = "var(--surfaceColor)";
                this.resizer.style.borderRadius = "100px";
            }

            document.addEventListener("mousemove", move);
            document.addEventListener("mouseup", stop);
        });

        this.resizer.addEventListener("mouseenter", () => {
            this.root.style.cursor = "col-resize";
            this.resizer.style.background = "var(--borderColor)";
        });

        this.resizer.addEventListener("mouseleave", () => {
            this.root.style.cursor = "";
            this.resizer.style.background = "var(--surfaceColor)";
        });

        this.wrapper = document.createElement("div");
        this.wrapper.id = "sideBarWrapper"
        this.wrapper.style.display = "flex";
        this.wrapper.style.flexShrink = "0";
        // this.wrapper.style.margin = "0 8px 0 8px";
        this.wrapper.style.overflow = "hidden";
        this.wrapper.style.borderRadius = "8px";
        this.wrapper.style.border = "1px solid var(--borderColor)"
        
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
        defineTreeView(this.content, tree);
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
        defineMakefileView(this.content, parsedResult);
    }
}