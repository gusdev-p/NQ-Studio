export const TabOpen = (identifier: string, oldIdentifier: string, path: string) => {
    document.dispatchEvent(new CustomEvent("tabOpen", {
        detail: {
            identifier: identifier,
            oldIdentifier: oldIdentifier,
            path: path
        }
    }));
}

export const DeleteTab = (identifier: string) => {
    document.dispatchEvent(new CustomEvent("deleteTab", {
        detail: {
            identifier: identifier
        }
    }));
}