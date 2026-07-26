import * as monaco from "monaco-editor";

const tokenMap: Record<string, string[]> = {
    comment: ["comment"],
    variableName: ["identifier", "variable"],
    string: ["string", "string.escape", "attribute.value"],
    number: ["number", "number.hex"],
    bool: ["keyword"],
    null: ["keyword"],
    keyword: ["keyword", "keyword.json"],
    operator: ["operator", "delimiter"],
    className: ["type.identifier"],
    definitionTypeName: ["type.identifier"],
    typeName: ["type"],
    angleBracket: ["delimiter.angle"],
    tagName: ["tag"],
    attributeName: ["attribute.name"],
};

interface NqThemeConfig {
    variant: "dark" | "light";
    settings: {
        background: string;
        foreground: string;
        caret: string;
        selection: string;
        lineHighlight: string;
        gutterBackground: string;
        gutterForeground: string;
    };
    styles: Record<string, string>;
}

function normalizeHex(color: string): string {
    let hex = color.replace("#", "");

    if (hex.length === 3) {
        hex = hex.split("").map((c) => c + c).join("");
    }
    return hex
}

export function buildMonacoTheme(config: NqThemeConfig): monaco.editor.IStandaloneThemeData {
    const rules: monaco.editor.ITokenThemeRule[] = [];

    for (const [key, color] of Object.entries(config.styles)) {
        const tokens = tokenMap[key];
        if (!tokens) continue;
        for (const token of tokens) {
            rules.push({ token, foreground: normalizeHex(color) });
        }
    }

    return {
        base: config.variant === "dark" ? "vs-dark" : "vs",
        inherit: true,
        rules,
        colors: {
            "editor.background": `#${normalizeHex(config.settings.background)}`,
            "editor.foreground": `#${normalizeHex(config.settings.foreground)}`,
            "editorCursor.foreground": config.settings.caret,
            "editor.selectionBackground": config.settings.selection,
            "editor.lineHighlightBackground": config.settings.lineHighlight,
            "editorGutter.background": config.settings.gutterBackground,
            "editorLineNumber.foreground": config.settings.gutterForeground,
        },
    };
}