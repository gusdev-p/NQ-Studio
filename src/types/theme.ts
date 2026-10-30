type ThemeVariant = "dark" | "light";

export interface ThemeTemplate {
    Variant: ThemeVariant;
    Theme: Record<string, string>;
}