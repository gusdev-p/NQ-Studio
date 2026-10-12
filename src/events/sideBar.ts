export const setTreeView = () => {
    document.dispatchEvent(new CustomEvent("treeView"));
}

export const setParseMakefile = () => {
    document.dispatchEvent(new CustomEvent("parseMakefile"));
}

export const setMakefileMainTarget = (target: string) => {
    document.dispatchEvent(new CustomEvent("setMainTarget", {
        detail: {
            target: target
        }
    }));
}

export const CreateDir = (name: string) => {
    document.dispatchEvent(new CustomEvent("createDir", {
        detail: {
            name: name
        }
    }));
}

export const CreateFile = (name: string) => {
    document.dispatchEvent(new CustomEvent("createFile", {
        detail: {
            name: name
        }
    }));
}

export const DefineMake = (path: string) => {
    document.dispatchEvent(new CustomEvent("defineMake", {
        detail: {
            path: path
        }
    }));
}