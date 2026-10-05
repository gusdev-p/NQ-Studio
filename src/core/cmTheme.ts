import { EditorView } from "codemirror";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import type { Extension } from "@codemirror/state";

interface NQThemeConfig {
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

const STYLE_TAGS = {
    comment:            t.comment,
    variableName:       t.variableName,
    string:             t.string,
    number:             t.number,
    bool:               t.bool,
    null:               t.null,
    keyword:            t.keyword,
    operator:           t.operator,
    className:          t.className,
    definitionTypeName: t.definition(t.typeName),
    typeName:           t.typeName,
    angleBracket:       t.angleBracket,
    tagName:            t.tagName,
    attributeName:      t.attributeName,
} as const;

export function buildCMTheme(config: NQThemeConfig): Extension {
    const { settings: s, styles, variant } = config;

    const view = EditorView.theme({
        "&": { color: s.foreground, backgroundColor: s.background },
        ".cm-content": { caretColor: s.caret },
        ".cm-cursor, .cm-dropCursor": { borderLeftColor: s.caret },
        "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
            backgroundColor: s.selection,
        },
        ".cm-activeLine": { backgroundColor: s.lineHighlight },
        ".cm-gutters": {
            backgroundColor: s.gutterBackground,
            color: s.gutterForeground,
            border: "none",
        },
        ".cm-activeLineGutter": { backgroundColor: s.lineHighlight },
    }, { dark: variant === "dark" });

    const specs = Object.entries(styles).flatMap(([key, color]) => {
        const tag = STYLE_TAGS[key as keyof typeof STYLE_TAGS];
        return tag ? [{ tag, color }] : [];
    });

    return [view, syntaxHighlighting(HighlightStyle.define(specs))];
}