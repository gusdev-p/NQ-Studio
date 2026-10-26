export const OpenRoot = (path: string) => {
    console.log("troca de root!");
    document.dispatchEvent(new CustomEvent("openRoot", {
        detail: {
            path: path
        }
    }));
}

export const OpenSecondarySideBar = () => {
    document.dispatchEvent(new CustomEvent("openSecondarySideBar"));
}

export const HideSecondarySideBar = () => {
    document.dispatchEvent(new CustomEvent("hideSecondarySideBar"));
}

export const ToggleTerminal = () => {
    document.dispatchEvent(new CustomEvent("toggleTerminal"));
}

export const UpdateTree = () => {
    document.dispatchEvent(new CustomEvent("updateTree"));
}