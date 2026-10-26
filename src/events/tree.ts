export const FileOpened = (content: string, type: string, path: string) => {
    document.dispatchEvent(new CustomEvent("fileOpened", {
        detail: {
            content: content,
            type: type,
            path: path
        }
    }));
}

export const RenameFile = (path: string) => {
    document.dispatchEvent(new CustomEvent("renameFile", {
        detail: {
            path: path
        }
    }));
}

export const DeleteFile = () => {
    document.dispatchEvent(new CustomEvent("deleteFile"));
}

export const FolderOpened = () => {
    document.dispatchEvent(new CustomEvent("folderOpened"));
}