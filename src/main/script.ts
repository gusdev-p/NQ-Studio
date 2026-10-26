import { side_bar, nqeditor, secondary_side_bar, fileBar, fileTabs, treeView, notificationManager } from "../core/renderer.js";
import { TabDumps } from "../core/ui/fileTabs.js";
import { DeleteFile } from "../events/tree.js";
import { HideSecondarySideBar, OpenRoot, OpenSecondarySideBar, ToggleTerminal, UpdateTree } from "../events/IDE.js";
import { CreateFile } from "../events/sideBar.js";
import { ReloadHTML, ReloadMarkdown } from "../events/preview.js";
import { NotificationType } from "../core/ui/notify/notificationManager.js";
import { saveTreeViewState } from "../core/ui/treeView/treeViewManager.js";

let waitForO = false;
let secondaryBarOpen = false
let oldTreeView: any;

const filesToNotOpen = [".jpg", ".png", ".jpeg", ".svg", ".gif"];


async function setTreeView(path: string) {
    side_bar.content.replaceChildren();
    
    const saved = await window.nq.getLocalProperty("treeView");
    console.log("opened treeview:", saved);

    if (saved && saved.root === path && Array.isArray(saved.items)) {
        console.log("getted!")
        await side_bar.defineTreeView(path, await treeView.mountFromDump(saved.items));
    } else {
        console.log("push")
        await side_bar.defineTreeView(path, await treeView.mountTreeView());
    }
}

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

        OpenRoot(String(result));
    }
    
    if (e.key.toLowerCase() === "delete") {
        DeleteFile()
    }

    if (e.ctrlKey && e.key.toLowerCase() === "n") {
        const result = await window.nq.ask("Create file", "Enter file name:");
        if (result === null) return
        CreateFile(String(result));
    }

    if (e.ctrlKey && e.key.toLowerCase() === "w") {
        e.preventDefault();
    }

    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() == "p") {
        if (!secondaryBarOpen) {
            OpenSecondarySideBar()
            secondaryBarOpen = true
        } else {
            HideSecondarySideBar()
            secondaryBarOpen = false;
        }
    }

    if (e.key.toLowerCase() === "tab") {
        e.preventDefault();
    }

    if (e.ctrlKey && e.key.toLowerCase() === "j") {
        ToggleTerminal()
    }

    if (e.ctrlKey && e.key.toLowerCase() === "f5") {
        await saveTreeViewState()
        UpdateTree()
    }

    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i") {
        e.preventDefault();
    }
});

document.addEventListener("createDir", async (e: any) => {
    console.log("--- createDir ---")
    
    try {
        const dirName = e.detail.name;
        const parent = await window.nq.getSelected() ?? await window.nq.getRoot();
        console.log("pai: " + parent);
        console.log("nome: " + dirName);
    
        const result = await window.nq.createDir(await window.nq.joinPath(parent, dirName));
    
        if (!result.success) {
            await window.nq.warn("Cant create directory", String(result.error));
        } else {
            await saveTreeViewState()
            UpdateTree()
        }
    } catch (e) {
        console.error("Failed to create directory:", e);

        await window.nq.warn(
            "Cant Create Directory",
            String(e)
        )
    }
});

document.addEventListener("createFile", async (e: any) => {
    console.log("--- createFile ---")
    const fileName = e.detail.name;
    let parent = await window.nq.getSelected() ?? await window.nq.getRoot();

    console.log("parent:", parent);

    if (!(await window.nq.stat(parent)).isDirectory) {
        parent = await window.nq.getDirname(parent);
    }

    console.log("pai: ", parent);
    console.log("nome: ", fileName);
    console.log("path final:", await window.nq.joinPath(parent, fileName));

    const result = await window.nq.createFile(await window.nq.joinPath(parent, fileName));

    if (!result.success) {
        await window.nq.warn("Cant create file", String(result.error));
    } else {
        await saveTreeViewState()
        UpdateTree()
    }
});

document.addEventListener("renameFile", async (e: any) => {
    const path = e.detail.path;
    const targetName = await window.nq.ask("Rename file:", "Enter the new file name:");
    const result = await window.nq.renameFile(path, String(targetName));
    if (result.success) {
        await saveTreeViewState()
        UpdateTree()
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
        console.log("target: ", target)
        const stat = await window.nq.stat(target);

        if (target === ".") return;

        let result;
        let type;
        
        if (stat.isDirectory) {
            type = "directory";
        } else {
            type = "file"
        }

        const askPermission = await window.nq.getSetting("File Management", "Ask Permission");

        const confirm = askPermission ? await window.nq.askQuestion(`You want to delete this ${type}`, "You really want to delete: '" + target + "'?"): true;

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
            await window.nq.warn(`Cant delete ${type}`, String(result.error));
        } else {
            await saveTreeViewState()
            UpdateTree()
            await window.nq.setSelected(await window.nq.getRoot());
        }
});

export async function initListeners() {
    console.log("[SCRIPT]: registering listener to BOOT...")
    window.nq.onBoot(async () => {
        console.log("[SCRIPT]: received BOOT call");

        const rawTabs = await window.nq.getLocalProperty("fileTabs");

        if (!rawTabs) return;

        console.log("raw tabs:", rawTabs)
        const tabs = rawTabs as TabDumps;

        for (const tab of tabs.tabs) {
            await fileTabs.addFile(tab.identifier, tab.path);

            const newTab = fileTabs.getTab(tab.identifier);

            if (!newTab) {
                await window.nq.warn(
                    "Something went wrong",
                    `cant initialize the tab: '${tab.identifier}' :(`
                );
                return;
            }
            if (tab.modified === false) {
                const tabContent = await window.nq.openFile(tab.path);
                
                if (!tabContent) return;
                
                fileTabs.setBuffer(newTab, tabContent);
            } else {
                fileTabs.setBuffer(newTab, tab.buffer);
            }

            fileTabs.setModified(tab.identifier, tab.modified);
        }

        if (tabs.activeTab) {
            const activeTab = fileTabs.getTab(tabs.activeTab);

            if (activeTab) {
                fileTabs.setActive(tabs.activeTab);
                fileBar.appendFile({fileName: await window.nq.getFileName(tabs.activeTab), fileType: await window.nq.getFileExt(tabs.activeTab), filePath: tabs.activeTab})

                nqeditor.setContent(
                    activeTab.buffer,
                    activeTab.path
                );

                nqeditor.setLanguage(
                    nqeditor.toLanguage(
                        await window.nq.getFileExt(activeTab.path),
                        activeTab.fileName
                    )
                );
            }
        }

        await setTreeView(await window.nq.getRoot())
    });

    window.nq.onShutdown(async () => {
        console.log("[SCRIPT]: Received SHUTDOWN call.");

        const active = fileTabs.getActive();

        if (active) {
            fileTabs.setBuffer(active, nqeditor.getContent());
        }

        const dump = fileTabs.dumpTabs();
        console.log(dump);
        await window.nq.setLocalProperty("fileTabs", dump);

        await saveTreeViewState();

        await window.nq.shutdownNow();
    });

    document.addEventListener("treeView", async () => {
        console.log(await window.nq.getRoot());
        await setTreeView(await window.nq.getRoot());
    });

    document.addEventListener("openFile", async (e:any) => {
        const path = e.detail.path;

        const content = await window.nq.openFile(path);
        const name = await window.nq.getFileName(path);
        const ext = await window.nq.getFileExt(path);

        nqeditor.setContent(content, path);
        nqeditor.setLanguage(
            nqeditor.toLanguage(
                ext,
                String(name)
            )
        );

        fileTabs.addFile(path, path);
        fileTabs.setActive(path);
        fileBar.appendFile({fileName: name, filePath: path, filetype: ext});
    })

    document.addEventListener("fileOpened", async (e: any) => {
        // properties
        const fileContent = e.detail.content;
        const fileType = e.detail.type;
        const filePath = e.detail.path;
        const fileName = await window.nq.getFileName(filePath);

        // debug
        console.log("arquivo aberto!");
        console.log("conteúdo: ", fileContent);
        console.log("tipo: ", fileType);
        console.log("nome do arquivo: ", fileName);

        let found = false;
        filesToNotOpen.forEach((ext) => {
            if (ext == fileType) {
                found = true;
            }
        });

        if (found) {
            console.log("é imagem!")
            if (!secondary_side_bar.isOpen()) secondary_side_bar.show(window.innerWidth * 0.4);
            secondary_side_bar.setImagePreview(filePath);
            return;
        }

        const oldTab = fileTabs.getActive();
        
        if (oldTab) {
            fileTabs.setBuffer(
                oldTab,
                nqeditor.getContent()
            )
        }

        await fileTabs.addFile(filePath, filePath);

        const newTab = fileTabs.getTab(filePath);

        if (!newTab) return;

        nqeditor.setContent(newTab.buffer, newTab.path);
        nqeditor.setLanguage(
            nqeditor.toLanguage(
                fileType,
                String(fileName)
            )
        );

        fileBar.appendFile({
            fileName,
            filePath,
            fileType
        });

        fileTabs.setActive(filePath);
    });

    document.addEventListener("tabOpen", async (e: any) => {
        const fileIdentifier = e.detail.identifier;
        const oldIdentifier = e.detail.oldIdentifier;

        const oldTab = fileTabs.getTab(oldIdentifier);
        const newTab = fileTabs.getTab(fileIdentifier);

        if (!newTab) return;

        if (oldTab) {
            oldTab.buffer = nqeditor.getContent();
        }

        console.log("old: ", oldTab?.buffer);
        console.log("new: ", newTab.buffer);

        nqeditor.setContent(newTab.buffer, newTab.path);
        nqeditor.setLanguage(
            nqeditor.toLanguage(
                await window.nq.getFileExt(newTab.path),
                newTab.fileName
            )
        );

        fileTabs.setActive(fileIdentifier);
        fileBar.appendFile({fileName: newTab.fileName, fileType: await window.nq.getFileExt(newTab.path), filePath: newTab.path});
    }); 

    document.addEventListener("deleteTab", async (e: any) => {
        const fileIdentifier = e.detail.identifier
        const tab = fileTabs.getTab(fileIdentifier);

        if (!tab) return;

        if (tab.modified) {
            const askPermission = await window.nq.getSetting("File Management", "Ask Permission");

            const deleteTab = askPermission ? true : await window.nq.askQuestion("Unsaved tab", `The tab of '${tab.fileName}' was not saved\nYou want to delete anyway?`);
            
            if (!deleteTab) return;
        }

        fileTabs.removeFile(fileIdentifier);
        fileBar.removeFile()

        if (fileTabs.tabs < 1) {
            nqeditor.setContent(
                "All your tabs was deleted!\nClick in another file to open a brand new tab ;)",
                await window.nq.getRoot()
            );
            nqeditor.setLanguage(
                nqeditor.toLanguage(".txt", "")
            );
        }

    });

    document.addEventListener("fileModified", (e: any) => {
        const filePath = e.detail.path;
        
        console.log("arquivo modificado!", filePath);
        const tabIdentifier = fileTabs.getIdentifier(filePath);

        if (!tabIdentifier) return;

        fileTabs.setModified(tabIdentifier, true);
    });

    document.addEventListener("keydown", async (e) => {
        if (e.ctrlKey && e.key.toLowerCase() === "s") {
            e.preventDefault()
            console.log("pedido de arquivo pra ser salvo!");

            if (nqeditor.filePath === await window.nq.resolvePath(await window.nq.getAppPath("appData"), "nq-studio", "settings.jsonc")) {
                await window.nq.saveFile(nqeditor.filePath, nqeditor.getContent());
                return;
            }

            const result = await window.nq.saveFile(nqeditor.filePath, nqeditor.getContent())
            if (result.success) {
                console.log("arquivo salvo!");
                const tabIdentifier = fileTabs.getIdentifier(nqeditor.filePath);

                if (!tabIdentifier) return;

                fileTabs.setModified(tabIdentifier, false);

                if (secondary_side_bar.isOpen()) {
                    ReloadHTML()
                    ReloadMarkdown();
                }
            } else {
                await window.nq.warn(`Cant save the file: '${nqeditor.filePath}'`, String(result.error));
            }
        }

        if (e.key.toLowerCase() === await window.nq.getSetting("Input", "Run main target")) {
            const target = await window.nq.getLocalProperty("main_target");

            if (target) {
                const child = window.terminal.executeInTerminal(`make ${target}`);
            } else {
                const notification: NotificationType = {
                    title: "Make",
                    message: "No target defined to make.",
                    type: "error"
                }

                await notificationManager.notify(notification);
            }
        }
    });

    document.addEventListener("openRoot", async (e: any) => {
        await window.nq.setRoot(e.detail.path);
        await window.terminal.changeCwd(e.detail.path);
        treeView.setRoot(e.detail.path);
        await window.nq.setSelected(e.detail.path);
        console.log("pedido de troca de root!");
        console.log(e.detail.path);
        await window.nq.initNqDir();
        await setTreeView(e.detail.path);
    });

    document.addEventListener("updateTree", async () => {
        await setTreeView(await window.nq.getRoot());
    });

    document.addEventListener("openSecondarySideBar", () =>{
        if (!secondary_side_bar.isOpen()) secondary_side_bar.show(150);
    });

    document.addEventListener("hideSecondarySideBar", () => {
        secondary_side_bar.hide();
    });

    document.addEventListener("htmlPreview", async (e: any) => {
        const html = e.detail.path;
        console.log("path do html: ", await window.nq.resolvePath(await window.nq.getRoot(), html));

        if (!secondary_side_bar.isOpen()) secondary_side_bar.show(344);
        secondary_side_bar.setHTMlPreview(html);
    });

    document.addEventListener("server:htmlPreview", async (e: any) => {
        await window.server.closeHttpServer();
        const url = await window.server.openHttpServer(await window.nq.getRoot());
        if (!secondary_side_bar.isOpen()) secondary_side_bar.show(344);

        const path: string  = e.detail.path;
        const root = await window.nq.getRoot();

        secondary_side_bar.setHTMlPreview(await window.nq.joinPath(url, await window.nq.relativePath(root, path)));
    });

    document.addEventListener("server:openInBrowser", async (e: any) => {
        await window.server.closeHttpServer();
        const url = await window.server.openHttpServer(await window.nq.getRoot());

        const path: string = e.detail.path;
        const root = await window.nq.getRoot();

        await window.nq.openInBrowser(await window.nq.joinPath(url, await window.nq.relativePath(root, path)));
    });

    document.addEventListener("markdownPreview", async (e: any) => {
        if (!secondary_side_bar.isOpen()) secondary_side_bar.show(window.innerWidth * 0.4);
        secondary_side_bar.setMarkDownPreview(e.detail.path);
    });

    document.addEventListener("parseMakefile", async () => {
        let makefilePath = await window.nq.getLocalProperty("makefile");

        if (!makefilePath) {
            makefilePath = await window.nq.resolvePath(await window.nq.getRoot(), "makefile");
        }

        const parsed = await window.make.parse(makefilePath);
        console.log("parsed: ", parsed);
        side_bar.defineMakefileView(parsed);
    });

    document.addEventListener("setMainTarget", async (e: any) => {
        await window.nq.setLocalProperty("main_target", e.detail.target);
    });
}