import { PropertiesTabManager, PropertiesTabType } from "../../../api/modules/propertiesTabManager";
import { CreateDir, CreateFile, DefineMake } from "../../../events/sideBar";
import { DeleteFile, FileOpened, FolderOpened, RenameFile } from "../../../events/tree";
import { treeView } from "../../renderer";
import { TreeNode } from "./treeProvider";

export interface TreeItemDump {
    name: string;
    path: string;
    isOpen: boolean;
    children: TreeItemDump[]
}

export interface TreeViewDump {
    root: string;
    items: TreeItemDump[];
}

export class TreeItem {
    public logo!: HTMLImageElement
    private root!: HTMLDivElement
    public isOpen: boolean = false;
    private loaded: boolean = false;
    private tab!: HTMLDivElement;
    private children: TreeItem[] = [];
    private selected: boolean = false;
    private createInput: HTMLInputElement | null = null;

    constructor(
        public identifier: string,
        public node: TreeNode,
        private propertiesManager: PropertiesTabManager
    ) {}

    public async mount(): Promise<HTMLDivElement> {
        this.root = document.createElement("div");
        this.root.id = "tree-view";
        this.root.style.display = "flex";
        this.root.style.flexDirection = "column";
        this.root.style.gap = "5px";
        this.root.style.borderRadius = "6px";
        this.root.style.userSelect = "none";

        this.root.addEventListener("click", async (e) => {
            e.stopPropagation();
            await this.select()
        });

        this.root.addEventListener("mouseenter", () => {
            this.root.classList.add("hover");
        });

        this.root.addEventListener("mouseleave", () => {
            this.root.classList.remove("hover");
        })

        const itemDiv = document.createElement("div");
        itemDiv.id = "tree-view-item";
        itemDiv.style.display = "flex";
        itemDiv.style.gap = "3px";

        const title = document.createElement("span");
        title.id = "tree-view-title";
        title.innerText = this.node.name;
        title.style.color = "var(--fontColor)";

        this.logo = document.createElement("img");
        this.logo.id = "tree-view-logo";
        this.logo.style.width = "18px";
        this.logo.style.height = "18px";
        this.logo.src = await window.nq.getIcon(this.node.path);

        itemDiv.appendChild(title);
        itemDiv.prepend(this.logo);

        this.root.appendChild(itemDiv);

        this.root.addEventListener("contextmenu", async (e) => {
            e.stopPropagation();
            this.selected = true;
            await this.select();

            e.preventDefault();
            console.log("click do mouse!")
            this.showProperties(e);
            
        });

        this.root.addEventListener("dblclick", async (e) => {
            e.stopPropagation();

            if (!this.node.isDir) {
                const fileContent = await window.nq.openFile(this.node.path);
                const fileExt = await window.nq.getFileExt(this.node.path);

                FileOpened(fileContent, fileExt, this.node.path);
                return;
            }

            if (this.isOpen) {
                this.tab.style.display = "none";
                this.loaded = true;
                this.isOpen = false;
                return;
            }

            await this.open();
        });

        return this.root;
    }

    public async select() {
        document.querySelectorAll(".selected").forEach(item => {
            item.classList.remove("selected");
        });

        this.root.classList.remove("hover");
        this.root.classList.add("selected");

        treeView.setSelectedItem(this);
        await window.nq.setSelected(this.node.path);
    }

    public async showProperties(e: PointerEvent) {
        const tab: PropertiesTabType = {
            name: this.node.name,
            buttons: [
                {
                    name: "Delete",
                    type: "button",
                    worker: () => DeleteFile()
                },
                {
                    name: "Rename",
                    type: "button",
                    worker: () => RenameFile(this.node.path)
                },
                {
                  name: "",
                  type: "spacer",
                  worker: () => {}
                },
                {
                    name: "Copy Path",
                    type: "button",
                    worker: async () => {
                        await navigator.clipboard.writeText(this.node.path);
                    }
                },
                {
                    name: "Copy Path as URI",
                    type: "button",
                    worker: async () => {
                        await navigator.clipboard.writeText(await window.nq.pathToUri(this.node.path));
                    }
                }
            ]
        }

        if (!this.node.isDir) {
            tab.buttons.push({
                name: "Copy Content",
                type: "button",
                worker: async () => {
                    await navigator.clipboard.writeText(await window.nq.openFile(this.node.path));
                }
            });
            tab.buttons.push({
                name: "Set as 'makefile'",
                type: "button",
                worker: () => DefineMake(this.node.path)
            });
        }

        this.propertiesManager.addPropertiesTab(tab, e);
    }

    public async open() {
        if (!this.node.isDir || this.isOpen) return;

        if (this.loaded) {
            this.tab.style.display = "";
            this.isOpen = true;
            return;
        }
        
        const children = await window.nq.getTree(this.node.path);
        
        this.tab = document.createElement("div");
        this.tab.style.marginLeft = "10px";

        for (const file of children) {
            const item = new TreeItem(file.path, file, this.propertiesManager);

            this.children.push(item);
            this.tab.appendChild(await item.mount());
        }
        this.root.appendChild(this.tab);

        this.loaded = true;
        this.isOpen = true;
        FolderOpened();
    }
    
    public dump(): TreeItemDump {
        return {
            name: this.node.name,
            path: this.node.path,
            isOpen: this.isOpen,
            children: this.children.map(child => child.dump())
        }
    }


    public async restore(dump: TreeItemDump): Promise<void> {
        if (dump.path !== this.node.path) return;
        if (!this.node.isDir || !dump.isOpen) return;

        await this.open();

        for (const childDump of dump.children) {
            const child = this.children.find(item => item.identifier === childDump.path);

            if (child) {
                await child.restore(childDump);
            }
        }
    }

    public async showCreateInput(type: "file" | "directory"): Promise<void> {
        if (this.createInput) {
            this.createInput.remove();
            this.createInput = null;
            return;
        }

        if (!this.node.isDir) return;
        
        await this.select();
        await this.open();

        this.tab.querySelector(".tree-create-input")?.remove();

        const input = document.createElement("input");
        input.className = "tree-create-input";
        input.placeholder =
            type === "file"
                ? "Enter file name:"
                : "Enter directory name:";
        input.style.width = "calc(100% - 30px)";
        input.style.background = "var(--onSurfaceColor)";
        input.style.border = "none";
        input.style.outline = "none";
        input.style.padding = "3px 5px";
        input.style.borderRadius = "6px";
        input.style.color = "var(--fontColor)";

        this.createInput = input;

        this.tab.prepend(input);
        input.focus();

        const cleanup = () => {
            input.remove();
            this.createInput = null;
            document.removeEventListener("keydown", onKeyDown);
        }

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === "enter") {
                const name = input.value.trim();
                if (!name) return;

                type === "file"
                    ? CreateFile(name)
                    : CreateDir(name);
                
                cleanup();
            } else if (e.key.toLowerCase() === "escape") {
                cleanup();
            }
        }

        document.addEventListener("keydown", onKeyDown);
    }
}

export class TreeViewManager {
    private element!: HTMLDivElement
    private items: TreeItem[] = [];
    private alreadyMounted: boolean = false;
    private selectedItem: TreeItem | null = null;

    constructor(
        private root: string,
        private propertiesManager: PropertiesTabManager
    ) {}

    public setRoot(root: string): void {
        this.root = root;
        this.items = [];
        this.selectedItem = null;
        this.alreadyMounted = false;
    }

    public setSelectedItem(item: TreeItem): void {
        this.selectedItem = item;
    }

    public getSelectedItem(): TreeItem | null {
        return this.selectedItem;
    }

    public async mountTreeView(): Promise<HTMLDivElement> {
        if (this.alreadyMounted) {
            console.log("remontando!");
        }
        this.items = []
        console.log("[Tree View Manager]: Tree view mount!", this.root)
        this.element = document.createElement("div");
        this.element.id = "tree-view-root";
        this.element.style.flex = "1";
        this.element.style.minHeight = "0";
        this.element.style.overflowY = "auto";

        this.element.replaceChildren();

        const nodes = await window.nq.getTree(this.root);

        for (const node of nodes) {
            const item = new TreeItem(node.path, node, this.propertiesManager);

            this.items.push(item);
            this.element.appendChild(await item.mount());
        }

        this.alreadyMounted = true;
        return this.element;
    }


    public async mountFromDump(dump: TreeItemDump[]): Promise<HTMLDivElement> {
        if (this.alreadyMounted) {
            console.log("remontando!");
        }
        this.items = []
        console.log("[Tree View Manager]: Tree view mount from dump!")
        this.element = document.createElement("div");
        this.element.id = "tree-view-root";
        this.element.style.flex = "1";
        this.element.style.minHeight = "0";
        this.element.style.overflowY = "auto";

        const nodes = await window.nq.getTree(this.root);

        for (const node of nodes) {
            const item = new TreeItem(node.path, node, this.propertiesManager);

            this.items.push(item);
            this.element.appendChild(await item.mount());

            const nodeDump = dump.find(saved => saved.path === node.path);

            if (nodeDump) {
                await item.restore(nodeDump);
            }
        }

        this.alreadyMounted = true;
        return this.element;
    }

    public dump(): TreeItemDump[] {
        return this.items.map(item => item.dump());
    }

    public initListeners(): void {
        document.addEventListener("folderOpened", async () => {
            console.log("folder opened!");
            const dump: TreeViewDump = {
                root: this.root,
                items: this.dump()
            };

            const result = await window.nq.setLocalProperty("treeView", dump);

            result.success
                ? console.log("[Tree View Manager]: Tree view state saved!")
                : console.log("[Tree View Manager]:", result.error);
        });
    }
}

export async function saveTreeViewState() {
    const dump: TreeViewDump = {
        root: await window.nq.getRoot(),
        items: treeView.dump()
    }

    console.log("to dump:", dump);
    await window.nq.setLocalProperty("treeView", dump);
}
