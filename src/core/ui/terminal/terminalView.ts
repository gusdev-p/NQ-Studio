import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";

export class terminalView {
    private terminal!: Terminal;
    private fitAddon!: FitAddon;

    constructor(private root: HTMLElement) {
        this.init();
    }
    async init() {
        const font = await window.nq.getSetting("Console", "Font Family");
        console.log("console font:", font, "type: ", typeof font);
        this.terminal = new Terminal({
            fontFamily: font,
            fontSize: await window.nq.getSetting("Console", "Font Size") || 14,
        });
        this.fitAddon = new FitAddon();

        this.terminal.loadAddon(this.fitAddon);
        this.terminal.open(this.root);

        this.root.style.height = "100%";
        this.root.style.width = "100%";

        this.fitAddon.fit();

        const cwd = await window.nq.getRoot();
        
        await window.nq.terminal.create(cwd);

        this.terminal.onData(data => {
            
            window.nq.terminal.write(data);
        });

        window.nq.terminal.onData(data => {
            this.terminal.write(data);
        });

        window.addEventListener("resize", () => {
            this.fitAddon.fit();
            
            window.nq.terminal.resize(
                this.terminal.cols,
                this.terminal.rows
            );
        });

        const observer = new ResizeObserver(() => {
            this.fitAddon.fit();

            window.nq.terminal.resize(
                this.terminal.cols,
                this.terminal.rows
            );
        });

        observer.observe(this.root);
    }

    fit() {
        this.fitAddon.fit();
        
        window.nq.terminal.resize(
            this.terminal.cols,
            this.terminal.rows 
        );
    }
}