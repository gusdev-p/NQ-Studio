# changelog 📝

## v0.1.0-alpha
### The first update since the first commit 🎉

### What was added? ✨
- 📃 `HTML preview` : Added basic preview based on the 'iframe' element.
- 💻 `Executor`: Added basic executer for `.js` scripts.
- 🥈 `Secondary bar` : For now, only for the HTML preview.
- 🎨 `Extra theme setting`: Added `--onSurfaceColor` option.

### Incomplete features 🏗️
-  ⚙️ `Properties tab` : A simple tab (for display options like `rename`) for each file in the tree view.
- 📄 `Top bar` : The entire top bar is under development.
- 💻 `Executor` (Only for `HTMl`) : The executer does not open the browser, only uses the built-in preview

### Bug fixes 👾
- Remove the `tab` focus change.
- Remove some useless `<style>` from the [index.html](./src/main/index.html)
- Fixed bug in the functions `createFile` and `createDir` from [main.ts](./src/main.ts)

### Notes 📋
NQ-Studio is under development, so some features in the `What added?` may be uncomplete or may not work correctly