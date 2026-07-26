# changelog 📝

## v0.2.0-alpha
### Some refactors, changes and new features!

### What was added? ✨
- 🖼️ `image preview` : Now when you click on an image open a new tab with your imagem on there!
- 📄 `Markdown preview and support` : Adds basic markdown syntax and preview!
- ⚙️ `API calls` : Adds new API calls (don´t matter if you are not a developer).

### Changes 🔧
- 🖥️ `codemirror6 substituted by monaco-editor` : Because the monaco-editor has better support for all languages, auto-complete etc...


### Incomplete features 🏗️
-  ⚙️ `Properties tab` : A simple tab (for display options like `rename`) for each file in the tree view.
- 📄 `Top bar` : The entire top bar is under development.
- 💻 `Executor` (Only for `HTMl`) : The executer does not open the browser, only uses the built-in preview
- 📄 `API documentation` : Only the main API (`nq`) has basic documentation.

### Bug fixes 👾
- Add `break` in the `.html` **switch/case** in the [fileBar.ts](./src/core/ui/fileBar.ts)
- Resolved the `null bug` in the [script.ts](./src/main//script.ts) that changes the root to `null`
- Exported the class `Result`in the [settingsManager.ts](./src/core/settings//settingsManager.ts)

### Notes 📋
NQ-Studio is under development, so some features in the `What added?` may be incomplete or may not work correctly