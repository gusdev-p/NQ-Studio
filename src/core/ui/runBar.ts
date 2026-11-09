import { PropertiesTabManager, PropertiesTabType } from "../../api/modules/propertiesTabManager"

interface fileConfig {
    name: string;
    ext: string;
    path: string;
}

type runType = "active-file" | "makefile-target" | "open-in-preview" | "open-in-server-preview" | "open-in-browser" | "open-in-browser-server";

export class RunBar {
    private leftSide: HTMLElement;
    private rightSide: HTMLElement;

    private runTargetTitle: HTMLSpanElement = document.createElement("span");

    private runType: runType | null = null;

    private tabManager: PropertiesTabManager = new PropertiesTabManager(document.body);

    public activeFile: fileConfig | null = null;
    private activeFileTab: HTMLDivElement | null = null;

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
        this.leftSide.style.justifyContent = "start";
        this.leftSide.style.marginLeft = "10px";
        this.leftSide.style.alignItems = "center";
        this.leftSide.style.gap = "4px"

        this.rightSide = document.createElement("div");
        this.rightSide.id = "run-bar-right-side";
        this.rightSide.style.height = "100%";
        this.rightSide.style.display = "flex";
        this.rightSide.style.justifyContent = "end";
        this.rightSide.style.marginRight = "10px";
        this.rightSide.style.alignItems = "center";
        this.rightSide.style.gap = "4px"

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

    private async runTargetToText() {
        switch (this.runType) {
            case "active-file": {
                return `Active file ${this.activeFile ? `(${this.activeFile.name})` : "(No file detected)"}`
            }

            case "makefile-target": {
                return `makefile target ${await window.nq.getLocalProperty("main_target") ? `(${await window.nq.getLocalProperty("main_target")})` : ""}`
            }

            case "open-in-browser": {
                return `Open in browser`
            }
            
            case "open-in-browser-server": {
                return "Open in browser with server"
            }

            case "open-in-preview": {
                return "Open in the built-in preview"
            }

            case "open-in-server-preview": {
                return "Open in the built-in preview with server"
            }
        }
    }

    private async updateRunTarget() {
        this.runTargetTitle.innerText =
            `Active target: ${this.runType ? await this.runTargetToText() : "Nothing :/"}`
    }

    private async init() {
        // root
        const root = document.createElement("div");
        root.style.height = "35px";
        root.style.display = "flex";
        root.style.justifyContent = "center";
        root.style.alignItems = "center";
        root.style.borderRadius = "8px";
        root.style.gap = "4px";
        root.style.background = "var(--onSurfaceColor)";
        root.style.padding = "0 5px";

        //run button

        const run = document.createElement("button");
        run.style.background = "var(--surfaceColor)";
        run.style.border = "none";
        run.style.padding = "5px 5px";
        run.style.borderRadius = "6px";
        run.style.height = "25px";
        run.style.display = "flex";
        run.style.alignItems = "center";
        run.style.gap = "4px";
        run.style.justifyContent = "center";

        const runTitle = document.createElement("span");
        runTitle.innerText = "Run";

        const runIcon = document.createElement("img");
        runIcon.style.height = "15px";
        runIcon.style.width = "15px";
        runIcon.src = await window.nq.getIcon("run", false);

        run.appendChild(runIcon);
        run.appendChild(runTitle);

        // stop button
        const stop = document.createElement("button");
        stop.style.background = "var(--surfaceColor)";
        stop.style.border = "none";
        stop.style.padding = "5px 5px";
        stop.style.borderRadius = "6px";
        stop.style.height = "25px";
        stop.style.display = "flex";
        stop.style.alignItems = "center";
        stop.style.gap = "4px";
        stop.style.justifyContent = "center";

        const stopTitle = document.createElement("span");
        stopTitle.innerText = "Stop";

        const stopIcon = document.createElement("img");
        stopIcon.style.height = "15px";
        stopIcon.style.width = "15px";
        stopIcon.src = await window.nq.getIcon("error", false);

        stop.appendChild(stopIcon);
        stop.appendChild(stopTitle);

        // reload button
        const reload = document.createElement("button");
        reload.style.background = "var(--surfaceColor)";
        reload.style.border = "none";
        reload.style.padding = "5px 5px";
        reload.style.borderRadius = "6px";
        reload.style.height = "25px";
        reload.style.display = "flex";
        reload.style.alignItems = "center";
        reload.style.gap = "4px";
        reload.style.justifyContent = "center";

        const reloadTitle = document.createElement("span");
        reloadTitle.innerText = "Reload";

        const reloadIcon = document.createElement("img");
        reloadIcon.style.height = "15px";
        reloadIcon.style.width = "15px";
        reloadIcon.src = await window.nq.getIcon("reload", false);

        reload.appendChild(reloadIcon);
        reload.appendChild(reloadTitle);

        root.appendChild(run);
        root.appendChild(stop);
        root.appendChild(reload);

        this.addLeft(root);
    }

    public async setActiveFile(config: fileConfig) {
        this.activeFileTab?.remove();

        this.activeFile = config;

        const tab = document.createElement("div");
        tab.style.borderRadius = "8px";
        tab.style.background = "var(--onSurfaceColor)";
        tab.style.border = "none";
        tab.style.padding = "5px 5px";
        tab.style.display = "flex";
        tab.style.justifyContent = "center";
        tab.style.alignItems = "center";
        tab.style.gap = "4px";
        tab.style.height = "35px";
        tab.style.boxSizing = "border-box"
        tab.style.flexShrink = "0";

        const tabTitle = document.createElement("span");
        tabTitle.style.height = "20px";
        tabTitle.innerText = this.activeFile.name;

        const tabIcon = document.createElement("img");
        tabIcon.style.height = "20px";
        tabIcon.style.width = "20px";

        tabIcon.src = await window.nq.getIcon(this.activeFile.path)

        tab.appendChild(tabIcon);
        tab.appendChild(tabTitle);
        this.activeFileTab = tab;

        this.addRight(tab);
    }

    public removeActiveFile() {
        this.activeFileTab?.remove();
        this.activeFileTab = null;
        this.activeFile = null;
    }
}