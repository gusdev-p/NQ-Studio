# Changelog 📝

## 0.6.1-alpha — Dev Build 🧑‍💻

### UX & Refactoring Update

> ⚠️ **Development build** — This version is currently available on the `dev` branch.

### ✨ New Features

- 🎨 **Preview Toolbars:** Every preview now has its own toolbar, featuring the file path, a reload button, and a close button.

- 🔔 **IDE Events:** Say goodbye to those annoying `document.dispatchEvent(...)` calls! You can now trigger IDE events directly, such as `OpenFile`.

- 📄 **JSONC Support:** JSON with comments is finally here! Files with the `.jsonc` extension can now include comments.

- ⚙️ **Settings:** Customize NQ-Studio with the first set of configurable options. More customization is planned for future updates.

- 💻 **Notification Manager:** A new module for displaying notifications. It's still under testing, but here's the best part: **this is the first module developed entirely within NQ-Studio!**

- 🖥️ **Automatic Tab Updates:** Open tabs without unsaved changes are now automatically refreshed to prevent outdated file contents.

- 🌐 **HTML Language Server:** Added HTML language server support to improve your front-end development experience.

- 🎨 **CSS Language Server:** CSS language server integration makes working with stylesheets easier and more convenient.

- 🖱️ **LSP Hover Documentation:** Hover over functions and other supported symbols to view documentation directly in the editor.

- 🖼️ **Build Logo & Improved Logging:** The build process now displays the NQ-Studio ASCII logo and provides more informative logs.

### 🔧 Improvements

- 📂 **Tree View Refactoring:** Completely reworked [`treeViewManager.ts`](./src/core/ui/treeView/treeViewManager.ts) to improve its structure and maintainability.

### 🚧 Work in Progress

- ⚙️ **Properties Tab:** This feature was nearly complete, but was accidentally removed during the Tree View refactoring. It'll be back in the next update, I promise!

- 📄 **Makefile Tab:** Still needs some fine-tuning, but it can already detect and display the variables found in your Makefile.

- 🛠️ **Building NQ-Studio:** You can now build NQ-Studio for AppImage and Debian package formats. These builds are experimental and are not officially supported yet.

### 👾 Bug Fixes

- 📑 **File Tabs** ([`fileTabs.ts`](./src/core/ui/fileTabs.ts)): Fixed issues related to tab state management and buffers.

- 📄 **File Bar** ([`fileBar.ts`](./src/core/ui/fileBar.ts)): Fixed issues affecting file bar behavior, including HTML preview execution.

- 📝 **Editor Diagnostics** ([`nqEditor.ts`](./src/core/ui/renderer/nqEditor.ts)): Resolved an issue where editor errors would unexpectedly disappear while coding.

- 📂 **Tree View** ([`treeViewManager.ts`](./src/core/ui/treeView/treeViewManager.ts)): Fixed an issue that prevented the project root from updating correctly when switching projects.

### 📋 Notes

NQ-Studio, especially the `dev` branch, is still under active development. Some features listed above may be incomplete, unstable, or behave unexpectedly.

