# Changelog 📝

## 0.6.0-alpha Dev Build 🧑‍💻

### TypeScript LSP Update

> ⚠️ Development build - this version is currently available on the `dev` branch.

### What was added? ✨

* 🎨 `New UI`: UI changes to make it look prettier 💅

* 🖼️ `Support for .svg and .gif`: You can now view vector images and GIFs!

* 📁 `Icons added`: No more boring emojis! These new .svg icons took me an eternity to create...

* 🖥️ `TypeScript Support` : TypeScript is finally here! JavaScript is still supported, of course ;)

* ☕ `TypeScript LSP (Language Server Protocol) Support` : Now the editor actually knows what you are writing!

* ⚙️ `IDE lifecycle events` : Now NQ-Studio knows when the IDE is booting or when you want close!

* 📖 `File Tabs` : Now you can open more than 1 file per time!

* ⏱️ `Tab persistence` : Your tabs are saved each time you close the IDE.

### Changes 🔧

* 💻 `Editor` : While developing the update I developed HATE for monaco-editor. So I switched it back ;)

* 🌐 `API calls`: All API calls (yes, every single one) have been refactored and are now organized into modules! (You're welcome, future me.)

* 📄 `Renderer (Refactored)` : The [renderer.ts](./src/core/renderer.ts) was doing more than a simple renderer... So refactored!

### Incomplete features 🚧

* ⚙️ `Properties tab`: Just needs some fine-tuning... Don't worry! I promise that in the next update this will be finally done :)

* 📄 `Makefile tab`: For now, you can open Makefiles and execute their targets! May I will update this part in the next update ;)

### Bug fixes 👾

* Bug fixed in `setImagePreview()` - [secondaryBar.ts](./src/core/ui/secondaryBar.ts): The image path contained a duplicated root path.

* Bug fixes across all `API calls` - [API modules](./src/api/modules): Some API calls were returning things that didn't make any sense (thanks, past me), such as functions that were supposed to return a boolean but returned nothing instead.

* Bug fixed in all the `built-in previews` - [secondaryBar.ts](./src/core/ui/secondaryBar.ts): Every time you save a file the Markdown preview opens for nothing.

* Bug fixed in the `HTML preview` - [secondaryBar.ts](./src/core/ui/secondaryBar.ts): If you want to check your file directly (without any server) it works fine, but if you use any server the preview just wont work.

### Notes 📋

NQ-Studio (especially the `dev` branch) is under development, so some features mentioned in `What was added?` may be incomplete or may not work correctly.
