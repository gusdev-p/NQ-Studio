import { build } from "esbuild";
import { cpSync } from "fs";

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
    loader: {".ttf": "file"},
});

build({
    entryPoints: {
        "editor.worker": "node_modules/monaco-editor/esm/vs/editor/editor.worker.js",
        "json.worker": "node_modules/monaco-editor/esm/vs/language/json/json.worker.js",
        "css.worker": "node_modules/monaco-editor/esm/vs/language/css/css.worker.js",
        "html.worker": "node_modules/monaco-editor/esm/vs/language/html/html.worker.js",
        "ts.worker": "node_modules/monaco-editor/esm/vs/language/typescript/ts.worker.js",
    },
    bundle: true,
    format: "iife",           // <- script clássico, sem "type: module"
    platform: "browser",
    outdir: "dist/monaco-workers",
});

cpSync("src/main/index.html", "dist/main/index.html", {recursive: true});
cpSync("src/core/ui/ask/", "dist/core/ui/ask", {recursive: true});
cpSync("src/core/ui/warn/", "dist/core/ui/warn", { recursive: true});
cpSync("node_modules/monaco-editor/min/vs", "dist/vs", {recursive: true});