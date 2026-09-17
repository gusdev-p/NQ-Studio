export class mainSideBar {
    private root: HTMLElement;

    private bar: HTMLDivElement;
    private treeViewButton: HTMLButtonElement;
    private makeFileButton: HTMLButtonElement;
    private treeViewIcon!: HTMLImageElement;

    constructor(root: HTMLElement) {
        this.root = root;

        this.bar = document.createElement("div");
        this.bar.id = "mainSideBar"
        this.bar.style.width = "4%";
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
        this.treeViewButton.style.padding = "3px 8px";
        this.treeViewButton.style.cursor = "pointer";
        this.treeViewButton.onclick = () => {
            document.dispatchEvent(new CustomEvent("treeView"));
        };

        this.initTreeViewIcon();
    
        this.makeFileButton = document.createElement("button");
        this.makeFileButton.id = "mainSideBarMakefileButton";
        this.makeFileButton.innerText = "Make files.";
        this.makeFileButton.style.background = "var(--surfaceColor)";
        this.makeFileButton.style.color = "var(--fontColor)";
        this.makeFileButton.style.border = "none";
        this.makeFileButton.style.borderRadius = "12px";
        this.makeFileButton.style.padding = "10px 3px";
        this.makeFileButton.onclick = () => {
            document.dispatchEvent(new CustomEvent("parseMakefile"));
        }

        this.bar.appendChild(this.treeViewButton);
        this.bar.appendChild(this.makeFileButton);

        this.root.appendChild(this.bar);
    }

    private async initTreeViewIcon() {
        this.treeViewIcon = document.createElement("img");
        this.treeViewIcon.style.width = "min(50px, 100%)";
        this.treeViewIcon.style.height = "auto";
        this.treeViewIcon.style.objectFit = "contain"

        this.treeViewIcon.src = await window.nq.resolvePath("assets/icon_pack/folder.svg");

        this.treeViewButton.appendChild(this.treeViewIcon);
    }
}