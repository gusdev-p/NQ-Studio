import { type server, type nq, type terminal, type make, type lsp, type window } from "../core/preload";

declare global {
    interface Window {
        nq: typeof nq;
        terminal: typeof terminal;
        server: typeof server;
        make: typeof make;
        lsp: typeof lsp;
		windowm: typeof window;
    }
}

export {};