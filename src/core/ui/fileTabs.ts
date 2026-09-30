interface TabInfo {
    element: HTMLDivElement;
    path: string;
    fileName: string;
    modified: boolean;
    buffer: string;
    identifier: string
}

export class FileTabs {
    private root: HTMLDivElement;
    private bar: HTMLDivElement;
    private elements: Map<string, TabInfo>;
    private activeIdentifier: string | undefined;

    constructor(root: HTMLDivElement) {
        this.root = root;

        const bar = document.createElement("div");
        bar.id = "fileTabs";
        bar.style.width = "calc(100% - 1px)";
        bar.style.maxWidth = "100%";
        bar.style.height = "30px";
        bar.style.display = "flex";
        bar.style.gap = "5px";
        bar.style.background = "var(--surfaceColor)";
        bar.style.border = "1px solid var(--borderColor)";
        bar.style.borderRadius = "8px";
        bar.style.overflowX = "auto";
        bar.style.overflowY = "hidden";
        bar.style.display = "flex";
        bar.style.alignItems = "center";
        bar.style.gap = "3px";
        bar.style.boxSizing = "border-box";
        bar.style.margin = "1px";

        bar.addEventListener("wheel", (e) => {
            bar.scrollLeft += e.deltaX + e.deltaY;
            e.preventDefault();
        });

        this.bar = bar;

        this.elements = new Map<string, TabInfo>;

        this.root.appendChild(this.bar);

    }

    private async addIdentifier(identifier: string, tab: HTMLDivElement, path: string) {
        const fileName = await window.nq.getFileName(path);
        const fileContent = await window.nq.openFile(path);
        
        if (!fileName) return;

        const newTab: TabInfo = {element: tab, path, fileName: fileName, modified: false, buffer: fileContent, identifier: identifier};
        this.elements.set(identifier, newTab);
        this.activeIdentifier = identifier;
        console.log("new active tab:", this.activeIdentifier);
        this.bar.appendChild(tab);
    }

    private removeIdentifier(identifier: string, tab: HTMLDivElement) {
        this.elements.delete(identifier);
        this.bar.removeChild(tab);

        const last = Array.from(this.elements.entries()).at(-1);

        if (last) {
            const [, lastTab] = last;
            lastTab.element.click();
        }
    }

    public removeFile(identifier: string): boolean {
        const tab = this.elements.get(identifier);

        if (!tab) return false;

        this.elements.delete(identifier);
        tab.element.remove();

        if (this.activeIdentifier === identifier) {
            this.activeIdentifier = undefined;

            const last = Array.from(this.elements.values()).at(-1);

            if (last) {
                last.element.click();
            }
        }

        return true;
    }
    
    get tabs() {
        return this.elements.size;
    }

    public setBuffer(tab: TabInfo, buffer: string) {
        if (!tab) return;
        tab.buffer = buffer;
        console.log("tab:", tab.fileName, "received the buffer:", tab.buffer);
    }

    public setActive(identifier: string) {
        if (!this.elements.has(identifier)) {
            console.log("the identifier:", identifier, " does not exists!");
            return;
        };
        
        console.log("active tab defined to:", identifier);
        this.activeIdentifier = identifier;
    }

    public getActive() {
        return this.getTab(String(this.activeIdentifier));
    }

    public getTab(identifier: string): TabInfo | undefined {
        return this.elements.get(identifier);
    }

    private hasIdentifier(identifier: string): boolean {
        if (this.elements.has(identifier)) {
            return true;
        }
        return false;
    }

    public setModified(identifier: string, modified: boolean) {
        const tab = this.elements.get(identifier);

        if (!tab) return;

        const tabName = tab.element.querySelector("span");

        if (!tabName) return;

        tabName.textContent = modified
            ? `${tab.fileName} •`
            : `${tab.fileName}`

        tab.modified = modified;
    }

    public getIdentifier(path: string): string | undefined {
        for (const [identifier, tab] of this.elements) {
            if (tab.path == path) {
                return identifier;
            }
        }

        return undefined;
    }

    public async addFile(identifier : string, filePath: string) {
        if (this.hasIdentifier(identifier)) {
            const tab = this.elements.get(identifier);

            if (tab) {
                tab.element.click();
                return;
            }
        }

        const fileName = await window.nq.getFileName(filePath);
        const fileExt = await window.nq.getFileExt(filePath);
        const fileIcon = await window.nq.getIcon(filePath);

        const tab = document.createElement("div");
        tab.id = `tab-${identifier}`;
        tab.style.height = "27px";
        tab.style.flex = "0 0 auto";
        tab.style.padding = "0 5px";
        tab.style.background = "var(--onSurfaceColor)";
        tab.style.color = "var(--fontColor)";
        tab.style.display = "flex";
        tab.style.alignItems = "center";
        tab.style.justifyContent = "center";
        tab.style.gap = "5px";
        tab.style.borderRadius = "6px";
        tab.style.cursor = "pointer";

        tab.addEventListener("click", (e) => {
            document.dispatchEvent(new CustomEvent("tabOpen", {
                detail: {
                    identifier: identifier,
                    oldIdentifier: this.activeIdentifier,
                    path: filePath,
                }
            }));
        });

        tab.addEventListener("mouseenter", (e) => {
            tab.classList.add("hover");
        });

        tab.addEventListener("mouseleave", (e) => {
            tab.classList.remove("hover");
        });

        const tabLogo = document.createElement("img");
        tabLogo.src = fileIcon;
        tabLogo.style.width = "17px";
        tabLogo.style.height = "17px";

        const tabName = document.createElement("span");
        tabName.innerText = `${fileName}`;

        const closeTab = document.createElement("button");
        closeTab.innerText = "✕";

        closeTab.style.background = "transparent";
        closeTab.style.border = "none";
        closeTab.style.color = "var(--fontColor)";
        closeTab.style.cursor = "pointer";
        closeTab.style.borderRadius = "4px";

        closeTab.addEventListener("mouseenter", (e) => {
            closeTab.style.background = "var(--surfaceColor)";
        });

        closeTab.addEventListener("mouseleave", (e) => {
            closeTab.style.background = "transparent";
        });

        closeTab.addEventListener("click", (e) => {
            e.stopPropagation();
            document.dispatchEvent(new CustomEvent("deleteTab", {
                detail: {
                    identifier: identifier,
                }
            }));
        });

        tab.appendChild(tabLogo);
        tab.appendChild(tabName);
        tab.appendChild(closeTab);

        await this.addIdentifier(identifier, tab, filePath);
    }
};