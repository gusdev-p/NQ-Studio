import { treeView } from "../../renderer";

export async function defineTreeView(root: HTMLElement | HTMLDivElement, tree: string, treeViewDiv: HTMLDivElement) {
    root.replaceChildren();
    root.innerHTML = "";
    root.id = "treeView";
    root.style.boxSizing = "border-box";
    root.style.padding = "8px 5px 8px 5px";
    root.style.gap = "0";
    root.style.display = "flex";
    root.style.flexDirection = "column";
    root.style.height = "100%";
    root.style.minHeight = "0";

    treeViewDiv.style.flex = "1";
    treeViewDiv.style.minHeight = "0";
    treeViewDiv.style.overflowY = "auto";

    const topBar = document.createElement("div");
    topBar.id = "topBar";
    topBar.style.width = "100%";
    topBar.style.height = "40px";
    topBar.style.margin = "0 0 5px 0";
    topBar.style.gap = "5px";
    topBar.style.display = "flex";
    topBar.style.alignItems = "center";
    topBar.style.borderBottom = "solid 1px var(--borderColor)";
    topBar.style.flexShrink = "0";

    const createDirBtn = document.createElement("button");
    createDirBtn.id = "create-dir-button";
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

    createDirBtn.addEventListener("click", async () => {
        
        const selected = treeView.getSelectedItem();

        if (!selected) return;

        await selected.showCreateInput("directory");
    });

    createFileBtn.addEventListener("click", async () => {
        const selected = treeView.getSelectedItem();

        if (!selected) return;

        await selected.showCreateInput("file");
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
    root.appendChild(treeViewDiv);
}