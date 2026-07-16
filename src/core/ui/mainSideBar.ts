export class mainSideBar {
    private root: HTMLElement;

    private bar: HTMLDivElement;

    private treeViewButton: HTMLButtonElement;

    constructor(root: HTMLElement) {
        this.root = root;

        this.bar = document.createElement("div");
        this.bar.id = "mainSideBar"
        this.bar.style.width = "4%";
        this.bar.style.height = "calc(100vh - 10px)";
        this.bar.style.borderRight = "solid 2px var(--borderColor)"
        this.bar.style.boxSizing = "border-box";
        this.bar.style.display = "flex";
        this.bar.style.alignItems = "center";
        this.bar.style.flexDirection = "column";
        this.bar.style.gap = "3px";
        this.bar.style.padding = "5px 5px 0 5px"

        this.treeViewButton = document.createElement("button");
        this.treeViewButton.id = "mainSideBarTreeViewButton"
        this.treeViewButton.innerText = "Tree view."

        this.treeViewButton.addEventListener("click", () => {
            const event = new CustomEvent("treeView");

            document.dispatchEvent(event);
        });

        this.bar.appendChild(this.treeViewButton)

        this.root.appendChild(this.bar);
    }
}