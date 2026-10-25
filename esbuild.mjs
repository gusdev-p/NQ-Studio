import { build } from "esbuild";
import { cpSync } from "fs";
import { exit } from "process";

// exactly 48 `process.stdout.write()` calls just to build this logo...
// please do NOT refactor this piece of art.

process.stdout.write("\x1b[33m\n")
process.stdout.write("████▒   ██▒  "); process.stdout.write("  ██████▒   "); process.stdout.write("             "); process.stdout.write("██████████▒  "); process.stdout.write("██████████▒  "); process.stdout.write("██▒     ██▒  "); process.stdout.write("████████▒    "); process.stdout.write("██▒  "); process.stdout.write("  ██████▒\n")
process.stdout.write("██▒██▒  ██▒  "); process.stdout.write("██▒     ██▒ "); process.stdout.write("             "); process.stdout.write("██▒         "); process.stdout.write("     ██▒      "); process.stdout.write("██▒     ██▒  "); process.stdout.write("██▒     ██▒  "); process.stdout.write("     "); process.stdout.write("██▒     ██▒\n")
process.stdout.write("██▒ ██▒ ██▒  "); process.stdout.write("██▒     ██▒ "); process.stdout.write("██████████▒  "); process.stdout.write("██████████▒");    process.stdout.write("      ██▒      "); process.stdout.write("██▒     ██▒  "); process.stdout.write("██▒     ██▒  "); process.stdout.write("██▒  "); process.stdout.write("██▒     ██▒\n")
process.stdout.write("██▒  ██▒██▒  "); process.stdout.write("██▒ ██▒ ██▒ "); process.stdout.write("             "); process.stdout.write("        ██▒  "); process.stdout.write("    ██▒      "); process.stdout.write("██▒     ██▒  "); process.stdout.write("██▒     ██▒  "); process.stdout.write("██▒  "); process.stdout.write("██▒     ██▒\n")
process.stdout.write("██▒   ████▒  "); process.stdout.write("  ██████▒   "); process.stdout.write("             "); process.stdout.write("██████████▒  "); process.stdout.write("    ██▒      "); process.stdout.write("██████████▒  "); process.stdout.write("████████▒    "); process.stdout.write("██▒  "); process.stdout.write("  ██████▒\n")
process.stdout.write("              "); process.stdout.write("    ██▒ \x1b[0m\n\n")

console.log("[\x1b[34mINFO\x1b[0m]: Compiling NQ-Studio core...")
try {
    await build({
        entryPoints: [
            "src/main.ts",
            "src/core/preload.ts",
            "src/core/ui/treeView/treeProvider.ts",
            "src/core/ui/treeView/treeViewManager.ts",
            "src/terminalManager.ts"
        ],
        outdir: "dist",
        bundle: true,
        platform: "node",
        external: ["electron", "path", "child_process", "fs", "fs/promises", "electron-prompt", "node-pty", "@xterm/xterm", "@xterm/addon-fit", "jsonc-parser"],
    });
} catch (e) {
    console.log("[\x1b[31mERROR\x1b[0m]: Build failed! :(")

    if (e instanceof Error) {
        console.log("Build error:", e.message);
    }
    exit(1);
}
console.log("[\x1b[32mSUCCESS\x1b[0m]: NQ-Studio core compiled!");

console.log("[\x1b[34mINFO\x1b[0m]: Compiling NQ-Studio UI...")
try {
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
} catch (e) {
    console.log("[\x1b[31mERROR\x1b[0m]: Build failed! :(")

    if (e instanceof Error) {
        console.log("Build Error:", e.message);
    }
    exit(1);
}
console.log("[\x1b[32mSUCCESS\x1b[0m]: NQ-Studio UI compiled!");

console.log("[\x1b[34mINFO\x1b[0m]: Moving base assets...")
try {
    cpSync("src/main/index.html", "dist/main/index.html", {recursive: true});
    cpSync("src/main/css/", "dist/main/css", {recursive: true});
    cpSync("src/core/ui/ask/", "dist/core/ui/ask", {recursive: true});
} catch (e) {
    console.log("[\x1b[31mERROR\x1b[0m]: Build failed! :(")

    if (e instanceof Error) {
        console.log("Build Error:", e.message);
    }
}

console.log("[\x1b[32mSUCCESS\x1b[0m]: Base assets moved!");
console.log("[\x1b[35mDONE\x1b[0m]: NQ-Studio compiled! (TS -> JS)");
console.log("[\x1b[34mINFO\x1b[0m]: If you want compile NQ-Studio to an app (like .AppImage or .deb) use 'npm run pack:dir' then 'npm run pack:linux' ;)");