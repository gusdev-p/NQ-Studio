export const ChangeLanguage = (lang: string) => {
    document.dispatchEvent(new CustomEvent("nqeditor:change-language", {
        detail: {
            lang: lang
        }
    }));
}

export const FileModified = (path: string) => {
    document.dispatchEvent(new CustomEvent("fileModified", {
        detail: {
            path: path
        }
    }));
}

export const OpenFile = (path: string) => {
    document.dispatchEvent(new CustomEvent("openFile", {
        detail: {
            path: path
        }
    }));
}