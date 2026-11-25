import { lsp } from "../api/preload/lsp"
import { make } from "../api/preload/make"
import { nq } from "../api/preload/nq"
import { server } from "../api/preload/server"
import { terminal } from "../api/preload/terminal"
import { windowManager } from "../api/preload/windowManager"
import { git } from "../api/preload/git"

declare global {
    interface Window {
        nq: typeof nq & {
            terminal: typeof terminal;
            server: typeof server;
            make: typeof make;
            lsp: typeof lsp;
            windowManager: typeof windowManager;
            git: typeof git;
        }
    }
}

export {};