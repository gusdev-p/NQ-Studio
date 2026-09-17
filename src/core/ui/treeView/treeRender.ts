import { TreeNode } from "./treeProvider";

export class treeItem {
    public element: HTMLDivElement;
    private root: HTMLElement;
    private isOpen: boolean;
    private label: HTMLSpanElement;
    private node: TreeNode;
    private loaded: boolean;
    private static selectedItem: treeItem | null = null;
    private static properties: HTMLDivElement | null = null;
    private static propertiesOwner: treeItem | null = null;
    private icon : HTMLImageElement;
    public is_selected: boolean = false;
    
    private tab: HTMLDivElement;

    constructor (node: TreeNode, root: HTMLElement) {
        this.root = root
        this.node = node
        this.element = document.createElement("div");
        this.tab = document.createElement("div");
        this.label = document.createElement("span");
        this.isOpen = false;
        this.loaded = false;

        this.label.textContent = `${node.name}`

        this.element.appendChild(this.label);
        this.element.style.display = "block";
        this.element.style.marginLeft = "8px";
        this.element.style.color = "var(--fontColor)";
        this.element.style.userSelect = "none";
        this.element.style.cursor = "pointer";

        this.icon = document.createElement("img");
        this.icon.style.width = "18px";
        this.icon.style.height = "18px";
        this.icon.style.marginRight = "3px";
        this.icon.style.imageRendering = "auto";
        this.icon.style.verticalAlign = "middle";

        this.element.appendChild(this.icon);
        this.element.appendChild(this.label);

        this.changeIcon();

        this.element.addEventListener("mouseenter", (e) => {
            if (this.is_selected) return;
            this.element.classList.add("hover");
        });

        this.element.addEventListener("mouseleave", (e) => {
            this.element.classList.remove("hover");
        });
        
        this.element.addEventListener("mousedown", (e) => {
            console.log("clique!");
            e.stopPropagation();
            this.select();

            if (e.button === 2) {
                e.preventDefault();
                console.log("direito!")
                this.showProperties(e);
            }
        });

        this.element.addEventListener("dblclick", async (e) => {
            e.stopPropagation();

            if (!node.isDir) {
                const fileContent = await window.nq.openFile(node.path);
                const fileType = await window.nq.getFileExt(node.path);

                document.dispatchEvent(new CustomEvent("fileOpened", {
                    detail: {
                        content: fileContent,
                        type: fileType,
                        path: node.path,
                    },
                }));

                return
            }

            if (this.isOpen) {
                this.tab.style.display = "none";
                this.loaded = true;
                this.isOpen = false;
                this.changeIcon();
                return;
            }

            if (this.loaded) {
                this.tab.style.display = "";
                this.isOpen = true;
                this.changeIcon();
                return;
            }

            const child = await window.nq.getTree(node.path);

            this.tab = document.createElement("div");

            for (const file of child) {
                const item = new treeItem(file, root);
                this.tab.appendChild(item.element);
            }
            this.element.appendChild(this.tab);

            this.loaded = true;
            this.isOpen = true;
            this.changeIcon();
        });
    }

    private async changeIcon() {
        const fileType = await window.nq.getFileExt(this.node.path);

        if (this.node.isDir) {
            this.icon.src = await window.nq.resolvePath("assets/icon_pack/folder.svg");
        } else {
            switch (fileType) {
                case ".js": {
                    this.icon.src = await window.nq.resolvePath("assets/icon_pack/javascript.svg");
                    break;
                }

                case ".css": {
                    this.icon.src = await window.nq.resolvePath("assets/icon_pack/css.svg");
                    break;
                }

                case ".html": {
                    this.icon.src = await window.nq.resolvePath("assets/icon_pack/html.svg");
                    break;
                }

                case ".json": {
                    this.icon.src = await window.nq.resolvePath("assets/icon_pack/json.svg");
                    break;
                }

                case ".jpg":
                case ".png":
                case ".svg":
                case ".gif":
                case ".jpeg": {
                    this.icon.src = await window.nq.resolvePath("assets/icon_pack/image.svg");
                    break;
                }

                default: {
                    this.icon.src = await window.nq.resolvePath("assets/icon_pack/file.svg");
                    break;
                }
            }
        }

    }

    private async select() {

        //if (!this.node.isDir) return;

        console.log("selecionado!")
        if (treeItem.selectedItem) {
            treeItem.selectedItem.element.classList.remove("selected");
            treeItem.selectedItem.is_selected = false;
        }

        this.element.classList.remove("hover");
        this.element.classList.add("selected");
        this.is_selected = true;
        treeItem.selectedItem = this;
        window.nq.setSelected(this.node.path);
        console.log("path: ", this.node.path);
    }

    private showProperties(e: MouseEvent) {
        if (treeItem.properties) {
            document.body.removeChild(treeItem.properties);
            treeItem.properties = null;
            treeItem.propertiesOwner = null;
            return;
        }

        const properties = document.createElement("div");
        properties.id = "nodeProperties";
        properties.className = "dropdown";

        properties.style.position = "fixed";
        properties.style.top = `${e.clientY}px`;
        properties.style.left = `${e.clientX}px`;
        properties.style.background = "var(--surfaceColor)";
        properties.style.border = "1px solid #666";
        properties.style.minWidth = "180px";
        properties.style.zIndex = "1000"
        properties.style.display = "flex";
        properties.style.flexDirection = "column";
        properties.style.color = "var(--fontColor)";
        properties.style.fontWeight = "bold";

        properties.textContent = this.node.name;

        // properties options
        const renameButton = document.createElement("button");
        renameButton.id = "renameButton";
        renameButton.innerText = "Rename.";
        renameButton.onclick = () => {
            console.log('rename!');
            document.dispatchEvent(new CustomEvent("renameFile", {
                detail: {
                    path: this.node.path,
                }
            }));
            this.showProperties(e)
        }
        renameButton.style.color = "var(--fontColor)";
        renameButton.style.background = "transparent";
        renameButton.style.textAlign = "left";
        renameButton.style.border = "none";
        renameButton.style.padding = "3px 6px"
        renameButton.style.cursor = "pointer";
        renameButton.style.borderTop = "solid 1px var(--borderColor)"

        const makeButton = document.createElement("button");
        makeButton.id = "makeButton";
        makeButton.innerText = "Set as 'makefile'.";
        makeButton.onclick = () => {
            document.dispatchEvent(new CustomEvent("defineMake", {
                detail: {
                    path: this.node.path,
                },
            }));
            this.showProperties(e)
        };
        makeButton.style.color = "var(--fontColor)";
        makeButton.style.background = "transparent";
        makeButton.style.textAlign = "left";
        makeButton.style.border = "none";
        makeButton.style.padding = "3px 6px";
        makeButton.style.cursor = "pointer";

        const deleteButton = document.createElement("button");
        deleteButton.id = "deleteButton";
        deleteButton.innerText = "Delete.";
        deleteButton.onclick = async () => {
            document.dispatchEvent(new CustomEvent("deleteFile"));
            this.showProperties(e);
        }

        deleteButton.style.border = "none";
        deleteButton.style.background = "transparent";
        deleteButton.style.color = "var(--fontColor)";
        deleteButton.style.textAlign = "left";
        deleteButton.style.cursor = "pointer";
        deleteButton.style.padding = "3px 6px";

        properties.appendChild(renameButton);
        properties.appendChild(deleteButton);

        if (!this.node.isDir) {
            properties.appendChild(makeButton);
        }

        document.body.appendChild(properties);

        treeItem.properties = properties;
        treeItem.propertiesOwner = this;
    }

    public static getSelectedNode(): TreeNode | null {
        console.log("teste " + treeItem.selectedItem)
        return this.selectedItem?.node ?? null
    }
}

export class treeView {
    private root: HTMLElement;

    constructor (root: HTMLElement, dirs: TreeNode[]) {
        this.root = root;

        for (const dir of dirs) {
            const item = new treeItem(dir, root);

            this.root.appendChild(item.element);
        }
    }
}