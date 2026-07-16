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
    
    private tab: HTMLDivElement;

    constructor (node: TreeNode, root: HTMLElement) {
        this.root = root
        this.node = node
        this.element = document.createElement("div");
        this.tab = document.createElement("div");
        this.label = document.createElement("span");
        this.isOpen = false;
        this.loaded = false;

        this.label.textContent = node.isDir
            ? `> 📁 ${node.name}`
            : `📄 ${node.name}`

        this.element.appendChild(this.label);
        this.element.style.display = "block";
        this.element.style.marginLeft = "8px";
        this.element.style.color = "var(--fontColor)";
        this.element.style.userSelect = "none";
        this.element.style.cursor = "pointer";
        
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
        })
    }

    private changeIcon() {
        if (this.isOpen) {
            this.label.textContent = `v 📂 ${this.node.name}`
        } else {
            this.label.textContent = `> 📁 ${this.node.name}`
        }
    }

    private select() {

        //if (!this.node.isDir) return;

        console.log("selecionado!")
        if (treeItem.selectedItem) {
            treeItem.selectedItem.element.classList.remove("selected");
        }

        this.element.classList.add("selected");
        treeItem.selectedItem = this;
        window.nq.setSelected(this.node.path);
        console.log(treeItem.selectedItem);
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
        properties.style.background = "#333";
        properties.style.border = "1px solid #666";
        properties.style.minWidth = "180px";
        properties.style.zIndex = "1000"
        properties.style.display = "flex";
        properties.style.flexDirection = "column";

        properties.textContent = this.node.name;

        // properties options
        const renameButton = document.createElement("button");
        renameButton.id = "renameButton";
        renameButton.innerText = "Rename";
        renameButton.onclick = () => {
            console.log('rename!');
        }

        properties.appendChild(renameButton);

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