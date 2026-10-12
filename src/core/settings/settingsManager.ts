import fs from "fs";
import { app, ipcMain } from "electron";
import path from "path";
import { parse } from "jsonc-parser";

export const SETTINGS_PATH = path.resolve(app.getPath("appData"), "nq-studio", "settings.jsonc");

/**
 * ## Result
 * Base class for return debug informations of SettingsManager functions.
 * 
 * ### Values:
 * - `success`: A boolean value which if its **true** means that the function have been successfully ended.
 * - `error`: A string value that contains the error responsible to cause the fail of the function.
 */
export class Result {
    public success: boolean;
    public error: string | null = null;

    constructor(success: boolean, error: string | null) {
        this.success = success;
        this.error = error;
    }

    /**
     * ## values()
     * Return the Result class values as JSON format.
     */
    get values() {
        return { success: this.success, error: this.error };
    }
}

/**
 * ## SettingsManager
 * Responsible to manage all the configs of NQ-Studio.
 */
export class SettingsManager {
    private path!: string
    private config!: any

    constructor() {
        console.log("-=- Settings-manager boot! -=-");
    }

    /**
     * ## open()
     * Receive a path, open and parse.
     * @param path - the path which has the config file
     * @returns Result (class which has success and error properties)
     */
    open(path: string): Result {
        try {
            this.config = parse(fs.readFileSync(path, "utf-8"));
            this.path = path;
            console.log(`Settings-manager log -=-
Setting imported:
----------------->
${JSON.stringify(this.config, null, 4)}
<-----------------
`);
            return new Result(true, null);
        } catch (e: any) {
            console.error(e.message);
            return new Result(false, e.message);
        }
    }

    /**
     * ## get()
     * Try return the config value with the `key` name
     * @param key - The name of the value.
     * @returns The key value (or undefined if the value dont exists). null if you dont open the config file.
     */
    get(...keys: string[]) {
        if (!this.config) return null;
        
        let value = this.config;
        for (const key of keys) {
            value = value[key];
        }

        return value;
    }

    /**
     * ## Set
     * Re-write or define a setting to the main settings file.
     * 
     * NOTE: You probably should re-open the setting file after this operation to sync the new values.
     * @param key The setting name.
     * @param value The setting value.
     * @param rewrite If `true` re-writes the entire settings file, key parameter will be ignored.
     * @returns Absolutely nothing.
     */
    set(key: string, value: string, rewrite: boolean = false) {
        console.log(rewrite);
        if (!this.config) return;

        if (rewrite) {
            try {
                const content = parse(value);
                fs.writeFileSync(this.path, JSON.stringify(content));
                return;
            } catch (e) {
                console.error("[Settings Manager]: Cant re-write the config file:", e)
            }
        }

        try {
            const content = parse(this.path);
            content[key] = value;
            fs.writeFileSync(this.path, JSON.stringify(content));
            return;
        } catch (e) {
            console.error("[Settings Manager]: Cant define the setting:", key, " error:", e)
        }
    }

    getSettingContent() {
        return this.config;
    }
}


export const settingsManager = new SettingsManager();

settingsManager.open(
    SETTINGS_PATH
)