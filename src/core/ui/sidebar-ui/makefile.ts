export async function defineMakefileView(root: HTMLDivElement | HTMLElement, parsedResult : {
        functions: {
        value: string | undefined;
        line: number;
        }[];
        variables: {
        name: string | undefined;
        value: string | undefined;
        line: number;
        }[];
        commentaries: {
        value: string;
        line: number;
        }[];
        calls: {
        value: string;
        line: number;
        }[];
        path: string;
    }) {
        root.innerHTML = "";
        root.id = "MakefileView";
        root.style.boxSizing = "border-box";
        root.style.padding = "8px 5px 8px 5px";
        root.style.display = "flex";
        root.style.flexDirection = "column";
        root.style.gap = "13px";

        const functions = document.createElement("div");
        functions.id = "functions";
        functions.style.display = "flex";
        functions.style.flexDirection = "column";
        functions.style.gap = "8px";
        functions.style.background = "var(--onSurfaceColor)";
        functions.style.borderRadius = "8px";
        functions.style.overflow = "hidden";
        functions.style.boxSizing = "border-box";
        functions.style.padding = "5px"

        const functionsTitle = document.createElement("div");
        functionsTitle.style.width = "100%";
        functionsTitle.innerText = "Targets or Rules.";
        functionsTitle.style.color = "var(--fontColor)";
        functionsTitle.style.borderBottom = "2px solid var(--borderColor)";
        functionsTitle.style.fontWeight = "bold";

        functions.appendChild(functionsTitle);

        let count = 0;
        for (const functionOption of parsedResult.functions) {
            const functionDiv = document.createElement("div");
            functionDiv.style.color = "var(--fontColor)";
            functionDiv.style.background = "var(--onSurfaceColor)";
            functionDiv.style.border = "none";
            functionDiv.style.textAlign = "left";
            functionDiv.id = `function-${count}`;
            functionDiv.style.cursor = "pointer";
            functionDiv.style.display = "flex";
            functionDiv.style.justifyContent = "space-between";
            functionDiv.style.borderRadius = "6px";
            functionDiv.style.boxSizing = "border-box";
            functionDiv.style.padding = "0 3px";
            
            const functionTitle = document.createElement("label");
            functionTitle.innerText = `${functionOption.value}`;
            functionTitle.style.color = "var(--fontColor)";

            const functionLine = document.createElement("label");
            functionLine.innerText = `Line: ${functionOption.line}`;
            functionLine.style.color = "var(--fontColor)";

            functionDiv.appendChild(functionTitle);
            functionDiv.appendChild(functionLine);

            functionDiv.addEventListener("mouseenter", () => {
                functionDiv.style.background = "var(--surfaceColor)";
                functionTitle.innerText = `${functionOption.value}`;
                functionTitle.style.fontWeight = "bold";
            });

            functionLine.addEventListener("mouseenter", () => {
                functionLine.style.fontWeight = "bold";
                functionTitle.style.fontWeight = "";
            });

            functionLine.addEventListener("mouseleave", () => {
                functionLine.style.fontWeight = "";
            });

            functionDiv.addEventListener("mouseleave", () => {
                functionDiv.style.background = "var(--onSurfaceColor)";
                functionTitle.innerText = `${functionOption.value}`;
                functionTitle.style.fontWeight = "";
            });

            functionDiv.addEventListener("click", async () => {
                await window.nq.getLocalProperty("makefile") === undefined
                    ? window.terminal.executeInTerminal(`make ${functionOption.value}`)
                    : window.terminal.executeInTerminal(`make -f ${await window.nq.getLocalProperty("makefile")} ${functionOption.value}`);
            });

            functionTitle.addEventListener("click", () => {
                
            });

            functions.appendChild(functionDiv);
            count += 1;
        }
        
        root.appendChild(functions);
    }