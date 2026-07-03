import type { nq, terminal } from "../core/preload";

declare global {
    interface Window {
        nq: typeof nq;
        terminal: typeof terminal;
    }
}

export {};