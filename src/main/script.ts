let waitForO = false;
let secondaryBarOpen = false;

document.addEventListener("keydown", async (e) => {
    // pra debug :)
    //console.log(e.key.toLowerCase());
    if (e.ctrlKey && e.key.toLowerCase() === "k") {
        waitForO = true;
        return;
    }

    if (waitForO && e.key.toLowerCase() === "o") {
        waitForO = false;

        const result = await window.nq.askDir();

        if (result === null) {
            await window.nq.warn("Cant change root", "User canceled the operation.");
            return;
        }

        document.dispatchEvent(new CustomEvent("openRoot", {
            detail: {
                path: result,
            }
        }));
    }
    
    if (e.key.toLowerCase() === "delete") {
        document.dispatchEvent(new CustomEvent("deleteFile"));
    }

    if (e.ctrlKey && e.key.toLowerCase() === "n") {
        const result = await window.nq.ask("Create file", "Enter file name:");
        if (result === null) return
        document.dispatchEvent(new CustomEvent("createFile", {
            detail: {
                name: result,
            },
        }));
    }

    if (e.ctrlKey && e.key.toLowerCase() === "w") {
        e.preventDefault();
    }

    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() == "p") {
        if (!secondaryBarOpen) {
            document.dispatchEvent(new CustomEvent("openSecondarySideBar"));
            secondaryBarOpen = true
        } else {
            document.dispatchEvent(new CustomEvent("hideSecondarySideBar"));
            secondaryBarOpen = false;
        }
    }

    if (e.key.toLowerCase() === "tab") {
        e.preventDefault();
    }

    if (e.ctrlKey && e.key.toLowerCase() === "j") {
        document.dispatchEvent(new CustomEvent("toggleTerminal"))
    }

    if (e.key.toLowerCase() === "f5") {
        document.dispatchEvent(new CustomEvent("updateTree"))
    }

    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i") {
        e.preventDefault();
    }
});

document.addEventListener("createDir", async (e: any) => {
    console.log("--- createDir ---")
    const dirName = e.detail.name;
    const parent = await window.nq.getSelected();
    console.log("pai: " + parent);
    console.log("nome: " + dirName);

    const result = await window.nq.createDir(`${parent}/${dirName}`, false);

    if (!result.success) {
        await window.nq.warn("Cant create directory", result.error);
    } else {
        document.dispatchEvent(new CustomEvent("updateTree"));
    }
});

document.addEventListener("createFile", async (e: any) => {
    console.log("--- createFile ---")
    const fileName = e.detail.name;
    let parent = await window.nq.getSelected();

    if (!(await window.nq.stat(parent)).isDirectory) {
        parent = await window.nq.getDirname(parent);
    }

    console.log("pai: ", parent);
    console.log("nome: ", fileName);

    const result = await window.nq.createFile(`${parent}/${fileName}`, false);

    if (!result.success) {
        await window.nq.warn("Cant create file", result.error);
    } else {
        document.dispatchEvent(new CustomEvent("updateTree"));
    }
});

document.addEventListener("renameFile", async (e: any) => {
    const path = e.detail.path;
    const targetName = await window.nq.ask("Rename file:", "Enter the new file name:");
    const result = await window.nq.renameFile(path, String(targetName));
    if (result.success) {
        document.dispatchEvent(new CustomEvent("updateTree"));
    } else {
        await window.nq.warn("Cant rename file", String(result.error));
    }
});

document.addEventListener("toggleDevTools", () => {
    window.nq.openDevTools();
});

document.addEventListener("defineSrc", async (e: any) => {
    await window.nq.setLocalProperty("src-directory", e.detail.path);
    console.log(await window.nq.getLocalProperty("src-directory"));
});

document.addEventListener("defineMake", async (e: any) => {
    await window.nq.setLocalProperty("makefile", e.detail.path);
    console.log(await window.nq.getLocalProperty("makefile"));
});

document.addEventListener("deleteFile", async (e) => {
        console.log("--- delete ---")
        const target = await window.nq.getSelected();
        const stat = await window.nq.stat(target);

        if (target === ".") return;

        let result;
        let type;
        
        if (stat.isDirectory) {
            type = "directory";
        } else {
            type = "file"
        }

        const confirm = await window.nq.askQuestion(`You want to delete this ${type}`, "You really want to delete: '" + target + "'?");

        console.log("confirm: " + confirm);
        if (!confirm) {
            return
        }

        if (type === "directory") {
            result = await window.nq.removeDir(target);
        } else {
            result = await window.nq.removeFile(target);
        }

        if (!result.success) {
            await window.nq.warn(`Cant delete ${type}`, result.error);
        } else {
            document.dispatchEvent(new CustomEvent("updateTree"));
        }
});