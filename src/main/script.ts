let waitForO = false;

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

        document.dispatchEvent(new CustomEvent("openRoot", {
            detail: {
                path: result,
            }
        }));
    }

    if (e.key.toLowerCase() === "delete") {
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
});

document.addEventListener("createDir", async (e: any) => {
    console.log("--- createDir ---")
    const dirName = e.detail.name;
    const parent = await window.nq.getSelected();
    console.log("pai: " + parent);
    console.log("nome: " + dirName);

    const result = await window.nq.createDir(`${parent}/${dirName}`, true);

    if (!result.success) {
        await window.nq.warn("Cant create directory", result.error);
    } else {
        document.dispatchEvent(new CustomEvent("updateTree"));
    }
});

document.addEventListener("createFile", async (e: any) => {
    console.log("--- createFile ---")
    const fileName = e.detail.name;
    const parent = await window.nq.getSelected();

    const result = await window.nq.createFile(`${parent}/${fileName}`, true);

    if (!result.success) {
        await window.nq.warn("Cant create file", result.error);
    } else {
        document.dispatchEvent(new CustomEvent("updateTree"));
    }
});