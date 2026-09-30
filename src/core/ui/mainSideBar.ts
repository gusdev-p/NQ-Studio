export class mainSideBar {
    private root: HTMLElement;

    private bar: HTMLDivElement;
    private treeViewButton: HTMLButtonElement;
    private makeFileButton: HTMLButtonElement;
    private treeViewIcon!: HTMLImageElement;
    private makeFileIcon!: HTMLImageElement;

    constructor(root: HTMLElement) {
        this.root = root;

        this.bar = document.createElement("div");
        this.bar.id = "mainSideBar"
        this.bar.style.width = "50px";
        this.bar.style.minWidth = "50px";
        this.bar.style.height = "100%";
        this.bar.style.boxSizing = "border-box";
        this.bar.style.display = "flex";
        this.bar.style.alignItems = "center";
        this.bar.style.flexDirection = "column";
        this.bar.style.gap = "3px";
        this.bar.style.padding = "5px 5px 0 5px"
        this.bar.style.overflow = "hidden";
        this.bar.style.borderRadius = "8px";
        this.bar.style.border = "1px solid var(--borderColor)";

        this.treeViewButton = document.createElement("button");
        this.treeViewButton.id = "mainSideBarTreeViewButton";
        this.treeViewButton.style.background = "var(--surfaceColor)";
        this.treeViewButton.style.color = "var(--fontColor)";
        this.treeViewButton.style.border = "none";
        this.treeViewButton.style.borderRadius = "12px";
        this.treeViewButton.style.width = "40px";
        this.treeViewButton.style.height = "40px";
        this.treeViewButton.style.padding = "5px";
        this.treeViewButton.style.boxSizing = "border-box";
        this.treeViewButton.style.cursor = "pointer";
        this.treeViewButton.onclick = () => {
            document.dispatchEvent(new CustomEvent("treeView"));
        };

        this.initTreeViewIcon();
    
        this.makeFileButton = document.createElement("button");
        this.makeFileButton.id = "mainSideBarMakefileButton";
        this.makeFileButton.style.background = "var(--surfaceColor)";
        this.makeFileButton.style.color = "var(--fontColor)";
        this.makeFileButton.style.border = "none";
        this.makeFileButton.style.borderRadius = "12px";
        this.makeFileButton.style.width = "40px";
        this.makeFileButton.style.height = "40px"
        this.makeFileButton.style.padding = "5px";
        this.makeFileButton.style.boxSizing = "border-box";
        this.makeFileButton.style.cursor = "pointer";
        this.makeFileButton.onclick = () => {
            document.dispatchEvent(new CustomEvent("parseMakefile"));
        };

        this.initMakeFileIcon();

        this.bar.appendChild(this.treeViewButton);
        this.bar.appendChild(this.makeFileButton);

        this.root.appendChild(this.bar);
    }

    private async initTreeViewIcon() {
        this.treeViewIcon = document.createElement("img");
        this.treeViewIcon.style.width = "100%";
        this.treeViewIcon.style.height = "100%";
        this.treeViewIcon.style.objectFit = "contain"

        this.treeViewIcon.src = await window.nq.getIcon("folder", false);

        this.treeViewButton.appendChild(this.treeViewIcon);
    }

    private async initMakeFileIcon() {
        this.makeFileIcon = document.createElement("img");
        this.makeFileIcon.style.width = "100%";
        this.makeFileIcon.style.height = "100%";
        this.makeFileIcon.style.objectFit = "contain";

        this.makeFileIcon.src = await window.nq.getIcon("makefile", false);

        this.makeFileButton.appendChild(this.makeFileIcon);
    }
}