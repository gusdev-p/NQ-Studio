import { PropertiesTabManager, type PropertiesTabType } from "../../../api/modules/propertiesTabManager";
import { OpenFile } from "../../../events/editor";
import { setMakefileMainTarget } from "../../../events/sideBar";

const propertiesManager = new PropertiesTabManager(document.body);

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

        const toolBar = document.createElement("div");
        toolBar.id = "toolbar";
        toolBar.style.background = "var(--onSurfaceColor)";
        toolBar.style.width = "100%";
        toolBar.style.height = "30px";
        toolBar.style.display = "flex";
        toolBar.style.justifyContent = "space-around";
        toolBar.style.boxSizing = "border-box";
        toolBar.style.padding = "5px";
        toolBar.style.gap = "6px";
        toolBar.style.borderRadius = "8px"

        const pathDiv = document.createElement("div");
        pathDiv.id = "HTMLPreviewPathDiv";
        pathDiv.style.background = "#444";
        pathDiv.textContent = parsedResult.path;
        pathDiv.style.color = "#f1f1f1";
        pathDiv.style.borderRadius = "8px";
        pathDiv.style.padding = "3px 6px";
        pathDiv.style.flex = "1";
        pathDiv.style.minWidth = "0";
        pathDiv.style.whiteSpace = "nowrap";
        pathDiv.style.overflow = "hidden";
        pathDiv.style.textOverflow = "ellipsis"
        pathDiv.style.display = "flex";
        pathDiv.style.alignItems = "center";
        pathDiv.style.cursor = "text";

        toolBar.appendChild(pathDiv);

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
        functionsTitle.innerText = "Targets or Rules";
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

            functionDiv.addEventListener("mousedown", (e) => {
                if (e.button === 2) {
                    const tab: PropertiesTabType = {
                        name: String(functionOption.value),
                        buttons: [
                            {
                                name: "Set as 'main' Target",
								type: "button",
                                worker: () => {
                                    setMakefileMainTarget(String(functionOption.value));
                                }
                            }
                        ]
                    }
                    propertiesManager.addPropertiesTab(tab, e)
                }
            })
            
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

        const variables = document.createElement("div");
        variables.id = "variables";
        variables.style.display = "flex";
        variables.style.flexDirection = "column";
        variables.style.gap = "8px";
        variables.style.background = "var(--onSurfaceColor)";
        variables.style.borderRadius = "8px";
        variables.style.overflow = "hidden";
        variables.style.boxSizing = "border-box";
        variables.style.padding = "5px"

        const variablesTitle = document.createElement("div");
        variablesTitle.style.width = "100%";
        variablesTitle.innerText = "Variables";
        variablesTitle.style.color = "var(--fontColor)";
        variablesTitle.style.borderBottom = "2px solid var(--borderColor)";
        variablesTitle.style.fontWeight = "bold";

        variables.appendChild(variablesTitle);

        let variables_count = 0;
        for (const variableOption of parsedResult.variables) {
            const variableDiv = document.createElement("div");
            variableDiv.style.color = "var(--fontColor)";
            variableDiv.style.background = "var(--onSurfaceColor)";
            variableDiv.style.border = "none";
            variableDiv.style.textAlign = "left";
            variableDiv.id = `function-${count}`;
            variableDiv.style.cursor = "pointer";
            variableDiv.style.display = "flex";
            variableDiv.style.justifyContent = "space-between";
            variableDiv.style.borderRadius = "6px";
            variableDiv.style.boxSizing = "border-box";
            variableDiv.style.padding = "0 3px";
            
            const variableTitle = document.createElement("label");
            variableTitle.innerText = `${variableOption.value}`;
            variableTitle.style.color = "var(--fontColor)";

            const variableLine = document.createElement("label");
            variableLine.innerText = `Line: ${variableOption.line}`;
            variableLine.style.color = "var(--fontColor)";

            variableDiv.appendChild(variableTitle);
            variableDiv.appendChild(variableLine);

            variableDiv.addEventListener("mouseenter", () => {
                variableDiv.style.background = "var(--surfaceColor)";
                variableTitle.innerText = `${variableOption.value}`;
                variableTitle.style.fontWeight = "bold";
            });

            variableLine.addEventListener("mouseenter", () => {
                variableLine.style.fontWeight = "bold";
                variableTitle.style.fontWeight = "";
            });

            variableLine.addEventListener("mouseleave", () => {
                variableLine.style.fontWeight = "";
            });

            variableDiv.addEventListener("mouseleave", () => {
                variableDiv.style.background = "var(--onSurfaceColor)";
                variableTitle.innerText = `${variableOption.value}`;
                variableTitle.style.fontWeight = "";
            });

            variableDiv.addEventListener("click", async () => {
				OpenFile(
					await window.nq.resolvePath(
						await window.nq.getRoot(),
						await window.nq.getLocalProperty("makefile") ?? "makefile"
					)
				);
            });

            variableTitle.addEventListener("click", () => {
                
            });

            variables.appendChild(variableDiv);
            variables_count += 1;
        }
        
        root.appendChild(toolBar);
        root.appendChild(functions);
        root.appendChild(variables);
    }