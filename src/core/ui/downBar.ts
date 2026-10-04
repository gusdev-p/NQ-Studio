export class DownBar {
    private root: HTMLDivElement | HTMLElement;
    private bar: HTMLDivElement;
    private langTitle: HTMLSpanElement;
    
    constructor(root: HTMLDivElement | HTMLElement) {
        this.root = root;

        const downBar = document.createElement("div");
        downBar.id = "downBar";
        downBar.style.height = "30px";
        downBar.style.flexShrink = "0";
        downBar.style.background = "var(--surfaceColor)";
        downBar.style.borderRadius = "8px";
        downBar.style.border = "1px solid var(--borderColor)";
        downBar.style.display = "flex";
        downBar.style.alignItems = "center";
        downBar.style.justifyContent = "flex-end";
        downBar.style.gap = "5px";
        downBar.style.boxSizing = "border-box";
        downBar.style.padding = "7px";

        const langTitle = document.createElement("span");
        langTitle.id = "langTitle";
        langTitle.style.color = "var(--fontColor)";


        this.langTitle = langTitle;
        this.bar = downBar;

        this.bar.appendChild(this.langTitle);
        this.root.appendChild(this.bar);

        this.initListeners();
    }

    public languageToReadable(lang: string): string {
        switch (lang) {
            case "javascript": {
                return "JavaScript";
            }

            case "css": {
                return "CSS";
            }

            case "html": {
                return "HTML";
            }

            case "plaintext": {
                return "Text";
            }

            case "json": {
                return "JSON";
            }

            case "markdown": {
                return "Markdown";
            }

            default: {
                return "Text";
            }
        }
    }

    private async initListeners() {
        document.addEventListener("nqeditor:change-language", async (e: any) => {
            const lang = e.detail.language;

            this.langTitle.innerText = this.languageToReadable(lang);
        });
    }
}