import { toggleFold } from "@codemirror/language";

export class SecondarySideBar {
    private root!: HTMLElement;

    private maxWidth = window.innerWidth * 0.4;
    private minWidth = 50;

    private sidebar: HTMLDivElement;
    private resizer: HTMLDivElement;
    private wrapper: HTMLDivElement;
    private content: HTMLDivElement

    constructor(root: HTMLElement) {
        this.root = root;

        const sideBar = document.createElement("div");
        sideBar.id = "secondarySideBar";
        sideBar.style.height = "100%";
        sideBar.style.display = "none";
        sideBar.style.background = "var(--surfaceColor, #333)";
        sideBar.style.width = `${this.minWidth}px`;
        sideBar.style.flexShrink = "0";
        sideBar.style.borderRadius = "10px";
        sideBar.style.overflow = "auto";

        const resizer = document.createElement("div");
        resizer.id = "secondarySidBarResizer";
        resizer.style.height = "100%";
        resizer.style.width = "4.5px";
        resizer.style.background = "var(--borderColor, #333)";
        resizer.style.transition = "all 0.2s ease-in";
        resizer.style.borderRadius = "100px";


        resizer.addEventListener("mousedown", (e) => {
            e.preventDefault();
            resizer.style.borderRadius = "100%";
            resizer.style.background = "var(--accentColor, #1e8ed3)";
            document.body.style.cursor = "col-resize";
            const sideBarRect = sideBar.getBoundingClientRect();

            const startX = e!.clientX;
            const startWidth = sideBarRect.width

            const move = (e: MouseEvent) => {
                const delta = startX - e.clientX;

                const newWidth = Math.min(
                    this.maxWidth,
                    Math.max(this.minWidth, startWidth + delta)
                );

                sideBar.style.width = `${newWidth}px`;
            };

            const stop = () => {
                document.removeEventListener("mousemove", move);
                document.removeEventListener("mouseup", stop);
                document.body.style.userSelect = "";
                resizer.style.borderRadius = "100px"
                resizer.style.background = "var(--borderColor, #333)";
                document.body.style.cursor = "";
            };

            document.addEventListener("mousemove", move);
            document.addEventListener("mouseup", stop);
        });

        const content = document.createElement("div");
        content.id = "content";
        content.style.width = "100%";
        content.style.height = "100%";

        this.content = content;

        sideBar.appendChild(content)
        
        this.sidebar = sideBar;
        this.resizer = resizer;

        const wrapper = document.createElement("div");
        wrapper.id = "SecondarySideBarWrapper"
        wrapper.style.display = "flex";
        wrapper.style.gap = "4px";


        wrapper.appendChild(this.resizer);
        wrapper.appendChild(this.sidebar);
        
        this.wrapper = wrapper

        this.root.appendChild(this.wrapper);
    }

    show(width: number | string) {
        if (typeof width === "string" && width.toLowerCase() === "auto") {
            ;
        } else {
            this.sidebar.style.width = `${width}px`
        }
        this.wrapper.style.display = "flex";
        this.sidebar.style.display = "flex";
        this.resizer.style.display = "block";
    };

    hide() {
        this.wrapper.style.display = "none";
        this.sidebar.style.display = "none";
        this.resizer.style.display = "none";
    }

    async setHTMlPreview(html: string) {
        const path = `${await window.nq.getRoot()}/${html}`;
        this.content.innerHTML = "";
        this.content.id = "HTMLPreview"

        this.content.style.display = "flex";
        this.content.style.flexDirection = "column";

        const toolBar = document.createElement("div");
        toolBar.id = "HTMLPreviewToolBar"
        toolBar.style.backgroundColor = "var(--onSurfaceColor)";
        toolBar.style.width = "100%";
        toolBar.style.height = "30px";
        toolBar.style.display = "flex";
        toolBar.style.justifyContent = "space-around";
        toolBar.style.boxSizing = "border-box";
        toolBar.style.padding = "5px";
        toolBar.style.gap = "6px";

        const pathDiv = document.createElement("div");
        pathDiv.id = "HTMLPreviewPathDiv";
        pathDiv.style.background = "#333";
        pathDiv.textContent = path;
        pathDiv.style.color = "#f1f1f1";
        pathDiv.style.borderRadius = "3px";
        pathDiv.style.padding = "2px 6px";
        pathDiv.style.flex = "1";
        pathDiv.style.minWidth = "0";
        pathDiv.style.whiteSpace = "nowrap";
        pathDiv.style.overflow = "hidden";
        pathDiv.style.textOverflow = "ellipsis"
        pathDiv.style.display = "flex";
        pathDiv.style.alignItems = "center";

        const reloadBtn = document.createElement("button");
        reloadBtn.id = "HTMLPreviewReloadBtn";
        reloadBtn.innerText = "Reload";
        reloadBtn.style.flexShrink = "0";
        reloadBtn.onclick = () => {
            this.setHTMlPreview(html);
        }

        toolBar.appendChild(pathDiv);
        toolBar.appendChild(reloadBtn);

        const screenWrapper = document.createElement("div");
        screenWrapper.id = "HTMLPreviewScreenWrapper";
        screenWrapper.style.width = "100%";
        screenWrapper.style.height = "100%";

        const iframe = document.createElement("iframe");
        iframe.id = "HTMLPreviewIframe";
        iframe.src = path;
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.border = "none";
        iframe.style.background = "#fff";

        screenWrapper.appendChild(iframe);

        this.content.appendChild(toolBar);
        this.content.appendChild(screenWrapper);


        document.addEventListener("reloadHTML", () => {
            this.setHTMlPreview(html);
        })
    }

    isOpen() {
        return this.sidebar.offsetWidth > 1;
    }
}