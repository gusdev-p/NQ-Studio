type PropertiesButton = {
    name: string;
    worker: () => void | Promise<void>;
}

export type PropertiesTabType = {
    name: string;
    buttons: PropertiesButton[];
}

export class PropertiesTabManager {
    private currentTab: HTMLDivElement | null = null;

    constructor(private root: HTMLDivElement | HTMLElement) {}

    public addPropertiesTab(tab: PropertiesTabType, event: MouseEvent) {
        event.preventDefault();

        if (this.currentTab) {
            this.currentTab.remove();
            this.currentTab = null;
            return;
        }

        const root = document.createElement("div");
        
        root.id = `tab-${tab.name}`;
        root.className = "dropdown";
        
        root.style.position = "fixed";
        root.style.top = `${event.clientY}px`;
        root.style.left = `${event.clientX}px`;
        root.style.background = "var(--surfaceColor)";
        root.style.border = "solid 1px var(--borderColor)";
        root.style.minWidth = "180px";
        root.style.zIndex = "1000";
        root.style.display = "flex";
        root.style.flexDirection = "column";
        root.style.color = "var(--fontColor)";
        root.style.fontWeight = "bold";
        root.style.borderRadius = "6px";
        root.style.padding = "3px 5px";

        const close = () => {
            root.remove();

            document.removeEventListener("click", checkClick);

            if (this.currentTab === root) {
                this.currentTab = null;
            }
        }

        const checkClick = (e: PointerEvent) => {
            if (!root.contains(e.target as Node)) {
                close();
            }
        }

        document.addEventListener("click", checkClick);
        
        const title = document.createElement("span");
        title.innerText = tab.name;

        root.appendChild(title);

        tab.buttons.forEach(({ name, worker }, index) => {
            const button = document.createElement("button");

            button.id = `button-${name}`;
            button.innerText = name;

            button.style.color = "var(--fontColor)";
            button.style.background = "transparent";
            button.style.border = "none";
            button.style.padding = "3px 5px";
            button.style.cursor = "pointer";
            button.style.textAlign = "left";
            button.style.borderRadius = "4px";
            
            if (index === 0) {
                button.style.borderTop = "solid 1px var(--borderColor)";
            }

            button.addEventListener("mouseenter", () => {
                button.style.background = "var(--onSurfaceColor)";
            });

            button.addEventListener("mouseleave", () => {
                button.style.background  ="transparent";
            });

            button.addEventListener("click", async () => {
                root.remove();
                document.removeEventListener("click", checkClick);
                
                await worker();
            });

            root.appendChild(button);
        });

        this.currentTab = root;
        this.root.appendChild(root);
    }
}