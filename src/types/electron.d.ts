import { type server, type nq, type terminal, type make } from "../core/preload";

declare global {
    interface Window {
        nq: typeof nq;
        terminal: typeof terminal;
        server: typeof server;
        make: typeof make;
    }
}

export {};