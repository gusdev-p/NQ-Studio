import { execSync } from "child_process";
import {ipcMain, nativeTheme, systemPreferences } from "electron";
import { settingsManager } from "../../core/settings/settingsManager";

export class ThemeHandler {
    private verbose: boolean

    constructor(verbose: boolean = false) {
        this.verbose = verbose
        this.init();
    }

    public async init() {
        ipcMain.handle("getAccentColor", async (_) => {
            return systemPreferences.getAccentColor();
        });

        ipcMain.handle("getTheme", async (_) => {
            const electronDark = nativeTheme.shouldUseDarkColors;
            let isDarkTheme;

            try {
                const gnome = execSync(
                    "gsettings get org.gnome.desktop.interface color-scheme"
                ).toString().trim();

                const gnomeDark = gnome.includes("prefer-dark");

                isDarkTheme = electronDark || gnomeDark;
            } catch {
                isDarkTheme = electronDark;
            }

            const themeConfig = settingsManager.get("themes", "default");
            const darkTheme = settingsManager.get("themes", "dark", "theme");
            const lightTheme = settingsManager.get("themes", "light", "theme");
            if (this.verbose) {
                console.log("theme config:", themeConfig);
                console.log("is dark theme:", isDarkTheme);
                console.log("dark theme:", JSON.stringify(darkTheme, null, 4));
                console.log("light theme:", JSON.stringify(lightTheme, null, 4));
            }

            if (themeConfig === "auto") {
                this.verbose ? console.log("auto theme mode!") : null;
                if (isDarkTheme) return { theme: darkTheme, isDark: true };
                return { theme: lightTheme, isDark: false };
            } else {
                this.verbose ? console.log("custom theme mode!") : null;
                return { theme: settingsManager.get("themes", themeConfig, "theme"), isDark: settingsManager.get("themes", themeConfig, "variant") === "dark" };
            }
        });
    }
}