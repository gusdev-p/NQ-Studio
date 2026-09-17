# Changelog 📝

## 0.5.0-alpha Dev Build 🧑‍💻

### Tiny changes, refactors...

### What was added? ✨

* 🎨 `New UI`: UI changes to make it look prettier 💅

* 🖼️ `Support for .svg and .gif`: You can now view vector images and GIFs!

* 📁 `Icons added`: No more boring emojis! These new .svg icons took me an eternity to create...

### Changes 🔧

* 🌐 `API calls`: All API calls (yes, every single one) have been refactored and are now organized into modules! (You're welcome, future me.)

### Incomplete features 🚧

* ⚙️ `Properties tab`: Just needs some fine-tuning...

* 📄 `Makefile tab`: For now, you can open Makefiles and execute their targets!

### Bug fixes 👾

* Bug fixed in `setImagePreview()` - [secondaryBar.ts](./src/core/ui/secondaryBar.ts): The image path contained a duplicated root path.

* Bug fixes across all `API calls` - [API modules](./src/api/modules): Some API calls were returning things that didn't make any sense (thanks, past me), such as functions that were supposed to return a boolean but returned nothing instead.

### Notes 📋

NQ-Studio (especially the `dev` branch) is under development, so some features mentioned in `What was added?` may be incomplete or may not work correctly.
