export const TabOpen = (identifier: string, oldIdentifier: string, path: string, onOpened?: () => void) => {
    document.dispatchEvent(new CustomEvent("tabOpen", {
        detail: {
            identifier: identifier,
            oldIdentifier: oldIdentifier,
            path: path,
            onOpened
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