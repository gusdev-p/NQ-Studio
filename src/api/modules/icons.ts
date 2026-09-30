import { ipcMain, app } from "electron";
import fs from "fs";
import path from "path";
import { settingsManager } from "../../core/settings/settingsManager";


/*
NQ-Studio Icons API

    Part of the main api as a module, responsible for
resolving which icon (svg path) should be used for a given
file/folder, based on the currently selected icon pack.

*/

export class IconsHandler {
    private icons: any = null;
    private selected_icon_pack!: string;
    private icon_pack_path!: string;

    constructor(check: boolean = true) {
        this.init(check);
    }

    private init(check: boolean) {
        this.selected_icon_pack = settingsManager.get("icon_pack");

        const icon_pack_root = path.join(app.getPath("appData"), "nq-studio", "icon_pack");
        this.icon_pack_path = path.join(icon_pack_root, this.selected_icon_pack);

        const raw = JSON.parse(
            fs.readFileSync(path.join(this.icon_pack_path, "icon_pack.json"), "utf-8")
        );

        this.icons = raw.icons ?? raw;

        if (check) {
            const essential_icons = ["generic_file", "generic_image", "folder"];

            for (const i of essential_icons) {
                if (!this.icons[i]) {
                    console.error(`The icon: '${i}' is missing in the: '${this.selected_icon_pack}' icon pack :(`);
                    this.icons = null;
                    break;
                }
            }

            if (this.icons) {
                console.log(`The icon pack: '${this.selected_icon_pack}' is valid!`);
            }
        }

        this.registerHandler();
    }

    private registerHandler() {
        ipcMain.handle("IconsManager::getIcon", (_, filePath: string, is_path: boolean = true) => {
            return this.getIcon(filePath, is_path);
        });
    }

    private getIcon(filePath: string, isPath: boolean = true): string {
        if (!this. icons) {
            console.error("No icon pack defined, probably the pack is invalid or is missing some essential icon. Return to fallback icon...");
            return path.resolve("assets/icon_pack/generic_file.svg");
        }

        if (!isPath) {
            return path.join(this.icon_pack_path, this.icons[filePath]);
        }

        const fileName = path.basename(filePath);
        const fileExt = path.extname(filePath);
        const isDir = fs.statSync(filePath).isDirectory();

        if (isDir) {
            return path.resolve(this.icon_pack_path, this.icons.folder);
        } else {
            switch (fileExt) {
                case ".js":
                case ".mjs":
                case ".cjs": {
                    return path.join(this.icon_pack_path, this.icons.javascript ?? this.icons.generic_file);
                }

                case ".css": {
                    return path.join(this.icon_pack_path, this.icons.css ?? this.icons.generic_file);
                }

                case ".json": {
                    return path.join(this.icon_pack_path, this.icons.json ?? this.icons.generic_file);
                }

                case ".html": {
                    return path.join(this.icon_pack_path, this.icons.html ?? this.icons.generic_file);
                }

                case ".jpg":
                case ".png":
                case ".svg":
                case ".gif":
                case ".jpeg": {
                    return path.join(this.icon_pack_path, this.icons.generic_image);
                }

                default: {
                    switch (fileName.toLowerCase()) {
                        case "makefile": {
                            return path.join(this.icon_pack_path, this.icons.makefile ?? this.icons.generic_file);
                        }

                        default: {
                            return path.join(this.icon_pack_path, this.icons.generic_file);
                        }
                    }
                }
            }
        }
    }
}