import { ChildProcess, spawn } from "child_process";
import { ipcMain } from "electron";

export class ExecuterHandler {
    private processes = new Map<number, ChildProcess>()
    constructor(private verbose: boolean = false) {
        ipcMain.handle("executer:spawn", (_, command: string, args: string[] = [], cwd: string = process.cwd()) => {
            return this.execute(command, args, cwd);
        });

        ipcMain.handle("executer:kill", (_, pid: number, force: boolean = false) => {
            return this.kill(pid, force);
        });
    }

    execute(command: string, args: string[] = [], cwd: string = process.cwd()): ChildProcess {
        const child = spawn(command, args, {
            cwd: cwd,
            stdio: "pipe"
        });

        if (child.pid !== undefined) {
            this.processes.set(child.pid, child);
            if (this.verbose) console.log("[Executer Handler]: New child! PID:", child.pid);

            child.once("close", () => {
                this.processes.delete(child.pid!);
                if (this.verbose) console.log("[Executer Handler]: Child died :( PID:", child.pid);
            });
        }

        return child;
    }

    kill(pid: number, force: boolean = false): boolean {
        const child = this.processes.get(pid);

        if (!child) {
            if (this.verbose) console.error("[Executer handler]: The PID:", pid, "Dont exists :(");
            return false;
        }

        return child.kill(
            force
                ? "SIGKILL"
                : "SIGTERM"
        );
    }
}