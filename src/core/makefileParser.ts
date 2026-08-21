import { open } from "fs/promises"

export class MakefileParser {
    constructor() {
        console.log("-=- Makefile-parser boot! -=-")
    }

    async parse(filePath: string) {
        console.log("parse! e path: ", filePath)
        const content = await open(filePath)

        let functions: Array<{value: string | undefined, line: number}> = []
        let variables: Array<{ name: string | undefined, value: string | undefined, line: number }> = []
        let commentaries: Array<{value: string, line: number}> = []
        let calls: Array<{value: string, line: number}> = []

        let lineCount = 1;

        for await (const line of content.readLines()) {
            if (line.startsWith("#")) {
                commentaries.push({value: line, line: lineCount});
            }

            if (line.startsWith("$(") || line.startsWith("\t$(")) {
                calls.push({ value: line, line: lineCount });
            }

            if (!line.startsWith("$(") && !line.startsWith("\t$(") && !line.startsWith("#")) {
                if (line.includes(":")) {
                    if (line.includes("=")) {
                        variables.push({ name: line.split(":=")[0], value: line.split(":=")[1], line: lineCount });
                    } else {
                        functions.push({ value: line.split(":")[0], line: lineCount });
                    }
                } else if (line.includes("=")) {
                    variables.push({ name: line.split("=")[0], value: line.split("=")[1], line: lineCount });
                }
            }
            lineCount += 1;
        }
        const result = { functions: functions, variables: variables, commentaries: commentaries, calls: calls, path: filePath };
        console.log("result: ", result)
        return result
    }
}