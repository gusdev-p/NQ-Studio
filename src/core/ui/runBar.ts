interface FileConfig {
    name: string;
    ext: string;
    path: string;
}

export class RunBar {
    private leftSide: HTMLElement;
    private rightSide: HTMLElement;
    constructor(private parent: HTMLElement) {
        const root = document.createElement("div");
        root.style.width = "calc(100% - 10px)";
        root.style.height = "50px";
        root.style.display = "flex";
        root.style.boxSizing = "border-box";
        root.style.borderRadius = "10px";
        root.style.border = "solid 1px var(--borderColor)";
        root.style.margin = "0 5px";
        root.style.background = "var(--surfaceColor)";
        root.style.justifyContent = "space-between";
        root.style.alignItems = "center";

        this.leftSide = document.createElement("div");
        this.leftSide.id = "run-bar-left-side";
        this.leftSide.style.height = "100%";
        this.leftSide.style.display = "flex";
        this.leftSide.style.justifyContent = "center";
        this.leftSide.style.alignItems = "center";

        this.rightSide = document.createElement("div");
        this.rightSide.id = "run-bar-right-side";
        this.rightSide.style.height = "100%";
        this.rightSide.style.display = "flex";
        this.rightSide.style.justifyContent = "center";
        this.rightSide.style.alignItems = "center";

        root.appendChild(this.leftSide);
        root.appendChild(this.rightSide);

        parent.appendChild(root);

        this.init();
    }

    private addLeft(element: HTMLElement) {
        this.leftSide.appendChild(element);
    }

    private addRight(element: HTMLElement) {
        this.rightSide.appendChild(element);
    }

    private async init() {
        const runBtn = document.createElement("button");
        runBtn.id = "run-bar-run-button";
        runBtn.innerText = "run";

        this.addLeft(runBtn);
    }
}