import { contextBridge, ipcRenderer } from "electron";
import { TreeNode } from "./ui/treeView/treeProvider";
import { Result } from "../core/settings/settingsManager";

export const nq = {
    /**
     * ## getAccentColor
     * Returns the current accent color from the system.
     * @returns the current accent color.
     */
    getAccentColor(): Promise<string> {
        return ipcRenderer.invoke("getAccentColor");
    },
    /**
     * ## getTheme
     * If there is no custom theme, returns if the system is in dark-mode.
     * If is in a custom theme, returns the theme settings.
     * @returns 'true', 'false' or custom theme settings.
     */
    getTheme(): Promise<{ theme: any, isDark: boolean }> {
        return ipcRenderer.invoke("getTheme");
    },
    /**
     * ## getTree
     * Receives the `dir` path and returns the files inside.
     * @param dir The path to receives the files.
     * @returns All files inside the specified path as 'nodes'.
     */
    getTree(dir: string): Promise<TreeNode[]> {
        return ipcRenderer.invoke("getTree", dir);
    },
    /**
     * ## setRoot
     * Receives a path to set as the NQ-Studio root.
     * @param root The path to be the root.
     */
    setRoot(root: string): Promise<void> {
        return ipcRenderer.invoke("setRoot", root);
    },
    /**
     * ## getRoot
     * Returns the current root.
     * @returns the current root.
     */
    getRoot(): Promise<string> {
        return ipcRenderer.invoke("getRoot");
    },
    /**
     * ## openFile
     * Opens a file and returns the content.
     * @param file The path from the file to be opened.
     */
    openFile(file: string): Promise<string> {
        return ipcRenderer.invoke("openFile", file);
    },
    /**
     * ## saveFile
     * Creates a file in the specified path and set the content.
     * @param path The file path.
     * @param content The file content.
     * @returns An object with `success` and `error` values.
     */
    saveFile(path: string, content: string): Promise<{ success: boolean, error: null } | { success: boolean, error: string }> {
        return ipcRenderer.invoke("saveFile", path, content);
    },
    /**
     * ## getFileExt
     * Receives the file path and returns the file extension
     * @param file The file path.
     * @returns The file extension.
     */
    getFileExt(file: string): Promise<string> {
        return ipcRenderer.invoke("getFileExt", file);
    },
    /**
     * ## setSelected
     * Function usually used for treeNodes manipulation.
     * 
     * receives a path and define as the 'selected' node globally.
     * @param path The node path.
     */
    setSelected(path: string): Promise<void> {
        return ipcRenderer.invoke("setSelected", path);
    },
    /**
     * ## getSelected
     * Function usually used for treeNodes manipulation.
     * 
     * Returns the current selected path.
     * @returns the current selected path.
     */
    getSelected(): Promise<string> {
        return ipcRenderer.invoke("getSelected");
    },
    /**
     * ## askDir
     * Opens an window and asks the user for a directory.
     * Then returns the directory path or 'null' if the user cancels.
     * @returns The directory path or 'null'.
     */
    askDir(): Promise<string | null | undefined> {
        return ipcRenderer.invoke("askDir");
    },
    /**
     * ## ask
     * Creates an window and asks the user a question.
     * Then returns the user answer or 'null' if the user cancels.
     * @param title The title of the window.
     * @param question The question.
     * @return The user answer or 'null'.
     */
    ask(title: string, question: string): Promise<string | null> {
        return ipcRenderer.invoke("askInput", title, question);
    },
    /**
     * ## askQuestion
     * Creates an window and asks the user an yes/no question.
     * Then returns 'true' if the answer is 'yes' or 'false' if the answer is 'no' or 'cancel',
     * or 'null' if the user cancels
     * @param title 
     * @param question
     * @returns If answer is 'yes' returns 'true', if is 'no' or 'cancel' returns 'false'. If user cancels return 'null'.
     */
    askQuestion(title: string, question: string): Promise<unknown> {
        return ipcRenderer.invoke("askQuestion", title, question);
    },
    /**
     * ## warn
     * Creates an window and warns the user.
     * Returns 'true' if the users answer is 'ok' or 'null' if the user closes the window.
     * @param title The window title.
     * @param label The warn.
     * @returns 'true' if answer is 'ok' or 'null' if user closes the window.
     */
    warn(title: string, label: string): Promise<unknown> {
        return ipcRenderer.invoke("warn", title, label);
    },
    /**
     * ## createDir
     * Receives a path and creates an empty directory in the specified path.
     * @param dirName The directory path.
     * @param withGlobalPath If 'true' appends the `root` path to the `dirName` path.
     * @returns An object with the values 'success' and 'error'
     */
    createDir(dirName: string, withGlobalPath: boolean): Promise<{ success: boolean, error: any }> {
        return ipcRenderer.invoke("createDir", dirName, withGlobalPath);
    },
    /**
     * ## createFile
     * Receives the path and creates an empty file in the specified path
     * @param fileName The path to create the file.
     * @param withGlobalPath If 'true' appends the `root` path to the `fileName` path.
     */
    createFile(fileName: string, withGlobalPath: boolean): Promise<{ success: boolean, error: any }> {
        return ipcRenderer.invoke("createFile", fileName, withGlobalPath);
    },
    /**
     * ## removeDir
     * Receives a directory path and try to delete it.
     * If the directory is not empty it will not be deleted.
     * @param dirName The directory path.
     * @returns An object with the values 'success' and 'error'
     */
    removeDir(dirName: string): Promise<{ success: boolean, error: any }> {
        return ipcRenderer.invoke("removeDir", dirName);
    },
    /**
     * ## removeFile
     * Receives a path do delete (specifically files).
     * @param fileName The file path.
     * @returns An object with the values 'success' and 'error'
     */
    removeFile(fileName: string): Promise<{ success: boolean, error: any }> {
        return ipcRenderer.invoke("removeFile", fileName);
    },
    /**
     * ## renameFile
     * Receives a path and a new name for the file.
     * Then renames it.
     * @param pathToMove The file path to be renamed.
     * @param name The new name.
     * @returns An object with the values 'success' and 'error'
     */
    renameFile(pathToMove: string, name: string): Promise<{ success: boolean, error: null } | { success: boolean, error: string }> {
        return ipcRenderer.invoke("renameFile", pathToMove, name);
    },
    /**
     * ## stat
     * Receives a path, then returns an object with values that tell
     * if the file is a directory or if its a file
     * @param filePath 
     * @returns An object with the values 'isDirectory' and 'isFile'
     */
    stat(filePath: string): Promise<{ isDirectory: boolean, isFile: boolean }> {
        return ipcRenderer.invoke("stat", filePath);
    },
    /**
     * ## openSetting
     * Receives a path and open the path as the NQ-Sudio settings.json file.
     * @param path The file path.
     * @returns Result (class which has the values 'success' and 'error')
     */
    openSetting(path: string): Promise<Result> {
        return ipcRenderer.invoke("openSetting", path);
    },
    /**
     * ## getSetting
     * Receives some keys and returns the value.
     * @param keys The keys to get the value.
     * @returns The keys combination value.
     */
    getSetting(...keys: string[]): Promise<any> {
        return ipcRenderer.invoke("getSetting", ...keys);
    },
    /**
     * ## getAppPath
     * Receives the name then returns the path
     * @param name The path to receive.
     * @returns The path with the correspondent name.
     */
    getAppPath(name: "home" | "appData" | "assets" | "userData" | "sessionData" | "temp" | "exe" | "module" | "desktop" | "documents" | "downloads" | "music" | "pictures" | "videos" | "recent" | "logs" | "crashDumps"): Promise<string> {
        return ipcRenderer.invoke("getAppPath", name);
    },
    /**
     * ## getFileName
     * Receives a path then returns the file name or the directory name.
     * @param path The path to receive the name.
     * @returns The name of the path.
     */
    getFileName(path: string): Promise<string | undefined> {
        return ipcRenderer.invoke("getFileName", path);
    },
    /**
     * ## exists
     * Checks if a file or a directory exists.
     * @param path The path to check if exists.
     * @param 'true' if the path exists, 'false' if not exists.
     */
    exists(path: string): Promise<boolean> {
        return ipcRenderer.invoke("exists", path);
    },

    joinPath(...paths: string[]): Promise<string> {
        return ipcRenderer.invoke("joinPath", ...paths)
    },

    getDirname(path: string): Promise<string> {
        return ipcRenderer.invoke("getDirname", path);
    },

    resolvePath(...paths: string[]): Promise<string> {
        return ipcRenderer.invoke("resolvePath", ...paths);
    }
};

export const terminal = {
    create(cwd: string) {
        return ipcRenderer.invoke("terminal:create", cwd);
    },

    write(data: string) {
        ipcRenderer.send("terminal:write", data);
    },

    resize(cols: number, rows: number) {
        ipcRenderer.send("terminal:resize", cols, rows);
    },

    onData(callback: (data: string) => void) {
        ipcRenderer.on("terminal:data", (_, data) => {
            callback(data);
        });
    },

    executeInTerminal(command: string) {
        ipcRenderer.invoke("terminal:exec", command);
    },

    changeCwd(newCwd: string) {
        ipcRenderer.invoke("terminal:cwdNew", newCwd);
    }
};


contextBridge.exposeInMainWorld("nq", nq);
contextBridge.exposeInMainWorld("terminal", terminal);