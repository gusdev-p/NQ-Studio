
export const reloadImage = () => {
    document.dispatchEvent(new CustomEvent("reloadImage"));
}


/**
 * HTML
*/

/**
 * ## Reload HTML
 * dispatch an event that tells the IDE to reload the built-in
 * HTML preview.
*/
export const ReloadHTML = () => {
    document.dispatchEvent(new CustomEvent("reloadHTML"));
}

/**
 * ## HTML Preview
 * dispatch an event that tells the IDE to open the build-in
 * HTML preview.
 * @param path The HTML file.
*/
export const HTMLPreview = (path: string) => {
    document.dispatchEvent(new CustomEvent("htmlPreview", {
        detail: {
            path: path
        }
    }));
}

/**
 * ## Server HTML Preview
 * dispatch an event that tells the IDE to open the built-in
 * HTML preview with the server.
 * @param path The HTML path
*/
export const ServerHTMLPreview = (path: string) => {
    document.dispatchEvent(new CustomEvent("server:htmlPreview", {
        detail: {
            path: path
        }
    }));
}

/**
 * ## Server HTML Preview Open In Browser
 * dispatch an event that tells the IDE to open the default
 * browser with the server.
 * @param path The HTML path.
*/
export const ServerHTMLPreviewOpenInBrowser = (path: string) => {
    document.dispatchEvent(new CustomEvent("server:openInBrowser", {
        detail: {
            path: path
        }
    }));
}

/**
 * Markdown
*/

/**
 * ## Reload Markdown
 * dispatch an event that tells the IDE to reload the built-in
 * Markdown preview.
 */
export const ReloadMarkdown = () => {
    document.dispatchEvent(new CustomEvent("reloadMarkdown"));
}

/**
 * ## Markdown Preview
 * dispatch an event tha tells the IDE to open the build-in
 * Markdown preview.
 * @param path The Markdown path.
 */
export const MarkdownPreview = (path: string) => {
    document.dispatchEvent(new CustomEvent("markdownPreview", {
        detail: {
            path: path
        }
    }));
}

