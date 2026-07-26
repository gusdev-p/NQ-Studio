(self as any).MonacoEnvironment = {
    getWorkerUrl: function (_moduleId: string, label: string) {
        const basePath = new URL("../monaco-workers/", document.baseURI).href;

        const map: Record<string, string> = {
            json: "json.worker.js",
            css: "css.worker.js",
            scss: "css.worker.js",
            less: "css.worker.js",
            html: "html.worker.js",
            handlebars: "html.worker.js",
            razor: "html.worker.js",
            typescript: "ts.worker.js",
            javascript: "ts.worker.js",
            markdown: "markdown.worker.js"
        };

        return basePath + (map[label] ?? "editor.worker.js");
    }
};