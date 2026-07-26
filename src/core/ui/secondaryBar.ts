import { marked } from "marked";
import DOMPurify from "dompurify";
export class SecondarySideBar {
    private root!: HTMLElement;

    private maxWidth = window.innerWidth * 0.4;
    private minWidth = 50;

    private sidebar: HTMLDivElement;
    private resizer: HTMLDivElement;
    private wrapper: HTMLDivElement;
    private content: HTMLDivElement;
    private currentMd!: string;

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
            document.dispatchEvent(new CustomEvent("reloadHTML"));
        }

        toolBar.appendChild(pathDiv);
        toolBar.appendChild(reloadBtn);

        const screenWrapper = document.createElement("div");
        screenWrapper.id = "HTMLPreviewScreenWrapper";
        screenWrapper.style.width = "100%";
        screenWrapper.style.height = "100%";

        const webview = document.createElement("webview");
        webview.id = "HTMLPreviewWebview";
        webview.src = path;
        webview.style.width = "100%";
        webview.style.height = "100%";
        webview.style.border = "none";
        webview.style.background = "#fff";

        screenWrapper.appendChild(webview);

        this.content.appendChild(toolBar);
        this.content.appendChild(screenWrapper);


        document.addEventListener("reloadHTML", () => {
            webview.reload();
        });
    }

    async setImagePreview(image: string) {
        const path = `${await window.nq.getRoot()}/${image}`;

        this.content.innerHTML = "";
        this.content.style.display = "flex";
        this.content.style.width = "100%";
        this.content.style.height = "100%";
        this.content.style.flexDirection = "column";
        this.content.id = "imagePreview";

        const toolbar = document.createElement("div");
        toolbar.style.width = "100%";
        toolbar.style.display = "flex";
        toolbar.style.justifyContent = "space-around";
        toolbar.id = "imagePreviewToolBar";
        toolbar.style.background = "var(--onSurfaceColor)";
        toolbar.style.height = "30px";
        toolbar.style.boxSizing = "border-box";
        toolbar.style.padding = "5px";
        toolbar.style.gap = "6px";

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
        reloadBtn.id = "imagePreviewReloadButton";
        reloadBtn.innerText = "Reload"
        reloadBtn.style.flexShrink = "0"
        reloadBtn.onclick = () => {
            document.dispatchEvent(new CustomEvent("reloadImage"));
        }

        toolbar.appendChild(pathDiv);
        toolbar.appendChild(reloadBtn);

        const wrapper = document.createElement("div");
        wrapper.id = "imagePreviewWrapper"
        wrapper.style.width = "100%";
        wrapper.style.height = "100%";
        wrapper.style.overflow = "hidden";
        wrapper.style.position = "relative";
        wrapper.style.cursor = "grab";

        const img = document.createElement("img");
        img.src = path;
        img.id = "imagePreviewImg";
        img.style.userSelect = "none";
        img.style.position = "absolute";
        img.style.top = "0";
        img.style.left = "0";
        img.style.transformOrigin = "0 0"; // essencial pro zoom no cursor funcionar certo
        img.style.userSelect = 'none';
        img.style.pointerEvents = "none";

        let zoom = 1;
        let panX = 0, panY = 0;
        let lastX = 0, lastY = 0;

        let dragging = false;

        wrapper.addEventListener("wheel", (e) => {
            e.preventDefault()

            const rect = wrapper.getBoundingClientRect();
            const cursorX = e.clientX - rect.left;
            const cursorY = e.clientY - rect.top;

            const imgPointX = (cursorX - panX) / zoom;
            const imgPointY = (cursorY - panY) / zoom;

            zoom *= e.deltaY > 0 ? 0.9: 1.1;
            zoom = Math.min(20, Math.max(0.05, zoom));

            panX = cursorX - imgPointX * zoom;
            panY = cursorY - imgPointY * zoom;

            img.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
        }, { passive: false });

        wrapper.addEventListener("mousedown", (e) => {
            dragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
            wrapper.style.cursor = "grabbing";
        });

        wrapper.addEventListener("mouseup", (e) => {
            dragging = false;
            wrapper.style.cursor = "grab";
        });

        wrapper.addEventListener("mousemove", (e) => {
            if (!dragging) return;

            const deltaX = e.clientX - lastX;
            const deltaY = e.clientY - lastY;

            panX += deltaX;
            panY += deltaY;

            lastX = e.clientX;
            lastY = e.clientY;

            img.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
        });
        
        wrapper.appendChild(img);

        this.content.appendChild(toolbar);
        this.content.appendChild(wrapper);
    }

    async setMarkDownPreview(md: string) {
        this.currentMd = md;
        console.log(md);

        const mdSource = await window.nq.openFile(md);

        this.content.style.background = "var(--surfaceColor)";
        this.content.style.color = "var(--fontColor)";
        this.content.innerHTML = DOMPurify.sanitize(marked.parse(mdSource) as string);

        const images = this.content.querySelectorAll("img");

        for (const img of images) {
            const src = img.getAttribute("src");
            if (!src) continue;

            if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:"))
                continue;

            const fullPath = await window.nq.resolvePath(await window.nq.getDirname(this.currentMd), src);
            img.src = fullPath;
        }

        this.content.addEventListener("click", async (e) => {
            const a = (e.target as HTMLElement).closest("a");
            if (!a) return;

            e.preventDefault();

            const href = a.getAttribute("href");
            if (!href) return;

            const next = await window.nq.resolvePath(
                await window.nq.getDirname(this.currentMd),
                href
            );

            await this.setMarkDownPreview(next);
        });
    }

    isOpen() {
        return this.sidebar.offsetWidth > 1;
    }
}