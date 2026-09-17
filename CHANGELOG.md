# Changelog 📝

## 0.5.0-alpha Dev Build 🧑‍💻
### Tiny changes, refactors...

### What was added? ✨
- 🎨 `New UI` : Changes in the UI to make it more beauty 💅
- 🖼️ `Support to .svg and .gif` : Now you can see your vectorial images and GIFs!
- 📁 `Icons added` : Boring emojis no more! with these new .svg icons that tok me an eternity to create...

### Changes 🔧
- 🌐 `API calls` : All the API calls (yes, everyone) was refactored and now they are modules! (you're welcome me from future)

### Incomplete features 🚧
- ⚙️ `Properties tab` : Just need some fine-tunning...
- 📄 `Makefile tab` : For now you can open and execute your targets!

### Bug fixes 👾
- Bug resolved in the `setImagePreview()` - [secondaryBar.ts](./src/core/ui/secondaryBar.ts) : The image path was with a duplicated root path.

- Bug resolved in all the `API Calls` - [API modules](./src/api/modules) : Some API calls returns things that don't make any sense (thanks to me from past) like a boolean function that returns nothing.

### Notes 📋
NQ-Studio (especially in the `dev` branch) is under development, so some features in the `What added?` may be incomplete or not work correctly