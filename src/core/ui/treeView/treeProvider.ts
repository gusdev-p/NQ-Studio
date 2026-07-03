import fs from "fs/promises";
import path from "path";


export interface TreeNode {
    name: string,
    path: string,
    isDir: boolean
}

export async function makeTreeNodes(dir: string): Promise<TreeNode[]> {
    const toReturn: TreeNode[] = [];

    const entries = await fs.readdir(dir, {
        withFileTypes: true,
    });

    for (const entry of entries) {
        toReturn.push({
            name: entry.name,
            path: path.join(dir, entry.name),
            isDir: entry.isDirectory()
        });
    };

    return toReturn;
}