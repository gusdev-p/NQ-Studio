import { build } from "esbuild";
import { cpSync } from "fs";
import { cp } from "fs/promises";

build({
    entryPoints: [
        "src/main.ts",
        "src/core/preload.ts",
        "src/core/ui/treeView/treeProvider.ts",
        "src/core/ui/treeView/treeRender.ts",
        "src/terminalManager.ts"
    ],
    outdir: "dist",
    bundle: true,
    platform: "node",
    external: ["electron", "path", "child_process", "fs", "fs/promises", "electron-prompt", "node-pty", "@xterm/xterm", "@xterm/addon-fit"],
});

build({
    entryPoints: [
        "src/core/renderer.ts",
        "src/main/script.ts",
    ],
    outdir: "dist",
    bundle: true,
    platform: "browser",
    external: ["electron", "path", "child_process", "fs", "fs/promises"],
});

cpSync("src/main/index.html", "dist/main/index.html", {recursive: true});
cpSync("src/core/ui/ask/", "dist/core/ui/ask", {recursive: true});
cpSync("src/core/ui/warn/", "dist/core/ui/warn", { recursive: true});