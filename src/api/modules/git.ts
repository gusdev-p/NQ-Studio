import { simpleGit, type SimpleGit } from "simple-git";
import { ipcMain } from "electron";

export class GitHandler {
    private git: GitManager

    constructor(private workDir: string) {
        this.git = new GitManager(workDir);
        this.register();
    }

    async register() {
        ipcMain.handle("git:isRepo", async (_) => {
            return await this.git.isRepository();
        });
        ipcMain.handle("git:init", async (_) => {
            return await this.git.init();
        });
        ipcMain.handle("git:status", async (_) => {
            return await this.git.status();
        });
        ipcMain.handle("git:add", async (_, files: string | string[]) => {
            return await this.git.add(files);
        });
        ipcMain.handle("git:commit", async (_, message: string) => {
            return await this.git.commit(message);
        });
        ipcMain.handle("git:log", async (_) => {
            return await this.git.log();
        });
        ipcMain.handle("git:branches", async (_) => {
            return await this.git.branches();
        });
        ipcMain.handle("git:push", async (_) => {
            return await this.git.push();
        });
        ipcMain.handle("git:pull", async (_) => {
            return await this.git.pull();
        });
    }

    unregister() {
        ipcMain.removeHandler("git:isRepo");
        ipcMain.removeHandler("git:init");
        ipcMain.removeHandler("git:status");
        ipcMain.removeHandler("git:add");
        ipcMain.removeHandler("git:commit");
        ipcMain.removeHandler("git:log");
        ipcMain.removeHandler("git:branches");
        ipcMain.removeHandler("git:push");
        ipcMain.removeHandler("git:pull");
    }
}

class GitManager {
    private git: SimpleGit;

    constructor(workDir: string) {
        this.git = simpleGit({
            baseDir: workDir
        });
    }

    async isRepository(): Promise<boolean> {
        return await this.git.checkIsRepo();
    }

    async init() {
        const result = await this.git.init();

        return JSON.parse(JSON.stringify(result));
    }

    async status() {
        const result = await this.git.status();

        return JSON.parse(JSON.stringify(result));
    }

    async add(files: string | string[]) {
        const result = await this.git.add(files);

        return JSON.parse(JSON.stringify(result));
    }

    async commit(message: string) {
        const result = await this.git.commit(message);

        return JSON.parse(JSON.stringify(result));
    }

    async log() {
        const result = await this.git.log();

        return JSON.parse(JSON.stringify(result));
    }

    async branches() {
        const result = await this.git.branch();

        return JSON.parse(JSON.stringify(result));
    }

    async push() {
        const result = await this.git.push();

        return JSON.parse(JSON.stringify(result));
    }

    async pull() {
        const result = await this.git.pull();

        return JSON.parse(JSON.stringify(result));
    }
}