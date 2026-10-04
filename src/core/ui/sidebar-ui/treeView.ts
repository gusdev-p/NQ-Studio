import { TreeView } from "../treeView/treeRender";

export async function defineTreeView(root: HTMLElement | HTMLDivElement, tree: string) {
    root.innerHTML = "";
    root.id = "treeView";
    root.style.boxSizing = "border-box";
    root.style.padding = "8px 5px 8px 5px";
    root.style.gap = "0";
    root.style.display = "flex";
    root.style.flexDirection = "column";

    const src = await window.nq.getTree(tree);
    const topBar = document.createElement("div");
    topBar.id = "topBar";
    topBar.style.width = "100%";
    topBar.style.height = "40px";
    topBar.style.margin = "0 0 5px 0";
    topBar.style.gap = "5px";
    topBar.style.display = "flex";
    topBar.style.alignItems = "center";
    topBar.style.borderBottom = "solid 1px var(--borderColor)";

    const createDirBtn = document.createElement("button");
    createDirBtn.style.background = "var(--onSurfaceColor)";
    createDirBtn.style.width = "30px";
    createDirBtn.style.height = "30px";
    createDirBtn.style.color = "var(--fontColor)";
    createDirBtn.style.border = "none";
    createDirBtn.style.borderRadius = "8px";
    createDirBtn.style.padding = "3px 5px";
    createDirBtn.style.cursor = "pointer";
    createDirBtn.style.display = "flex";
    createDirBtn.style.justifyContent = "center";
    createDirBtn.style.alignItems = "center";

    const dirLogo = document.createElement("img");
    dirLogo.src = await window.nq.getIcon("create_folder", false);
    dirLogo.style.width = "100%";
    dirLogo.style.height = "auto";

    createDirBtn.appendChild(dirLogo);

    const createFileBtn = document.createElement("button");
    createFileBtn.style.background = "var(--onSurfaceColor)";
    createFileBtn.style.width = "30px";
    createFileBtn.style.height = "30px";
    createFileBtn.style.color = "var(--fontColor)";
    createFileBtn.style.border = "none";
    createFileBtn.style.borderRadius = "8px";
    createFileBtn.style.padding = "3px 5px";
    createFileBtn.style.cursor = "pointer";

    const fileLogo = document.createElement("img");
    fileLogo.src = await window.nq.getIcon("create_file", false);
    fileLogo.style.width = "100%";
    fileLogo.style.height = "auto";

    createFileBtn.appendChild(fileLogo);

    let dirInput: HTMLInputElement | null = null;

    createDirBtn.addEventListener("click", () => {
        if (dirInput) {
            dirInput.remove();
            dirInput = null;
            return;
        } else if (fileInput) {
            fileInput.remove();
            fileInput = null;
        }

        dirInput = document.createElement("input");
        dirInput.placeholder = "Enter directory name:";
        dirInput.style.background = "var(--onSurfaceColor)";
        dirInput.style.border = "none";
        dirInput.style.outline = "none";
        dirInput.style.padding = "3px 5px";
        dirInput.style.borderRadius = "6px";
        dirInput.style.color = "var(--fontColor)";

        topBar.after(dirInput);
        dirInput.focus();

        const input = dirInput;

        const keydown = (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                document.dispatchEvent(new CustomEvent("createDir", {
                    detail: { name: input.value }
                }));

                input.remove();
                dirInput = null;
                document.removeEventListener("keydown", keydown);

            } else if (e.key === "Escape") {
                input.remove();
                dirInput = null;
                document.removeEventListener("keydown", keydown);
            }
        };

        document.addEventListener("keydown", keydown);
    });

    let fileInput: HTMLInputElement | null = null;

    createFileBtn.addEventListener("click", () => {
        if (fileInput) {
            fileInput.remove();
            fileInput = null;
            return;
        } else if (dirInput) {
            dirInput.remove();
            dirInput = null
        }

        fileInput = document.createElement("input");

        fileInput.placeholder = "Enter file name:";
        fileInput.style.backgroundColor = "var(--onSurfaceColor)";
        fileInput.style.border = "none";
        fileInput.style.outline = "none";
        fileInput.style.padding = "3px 5px";
        fileInput.style.borderRadius = "6px";
        fileInput.style.color = "var(--fontColor)";

        topBar.after(fileInput);
        fileInput.focus();

        const input = fileInput;

        const keydown = (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                console.log("create-file:", input.value);

                document.dispatchEvent(new CustomEvent("createFile", {
                    detail: {
                        name: input.value
                    }
                }));

                input.remove();
                fileInput = null;

                document.removeEventListener("keydown", keydown);

            } else if (e.key === "Escape") {
                input.remove();
                fileInput = null;

                document.removeEventListener("keydown", keydown);
            }
        };

        document.addEventListener("keydown", keydown);
    });
    
    const spacer = document.createElement("div");
    spacer.style.flex = "1";

    const rootName = document.createElement("span");
    rootName.innerText = await window.nq.getFileName(await window.nq.getRoot()) ?? "Unknown Project.";
    rootName.style.color = "var(--fontColor)";

    topBar.appendChild(rootName);
    topBar.appendChild(spacer);
    topBar.appendChild(createDirBtn);
    topBar.appendChild(createFileBtn);

    root.appendChild(topBar);
    const treeView = new TreeView(src) as HTMLDivElement;
    root.appendChild(treeView);
}