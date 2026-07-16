## NQ-Studio

<p align="center">
    <img src="./assets/logo.png" width="300px">
</p>


A simple IDE/Code Editor for JavaScript, HTML, CSS and Node.js projects :0

Tired of using a heavy IDE for a simple project? NQ-Studio is for you.


### Features ✨

- 💻 **Integrated Terminal** - You can execute your code without external terminals!
- 📂 **Tree View** - Much easier to see your files
- ⚡ **Lightweight** - Lightweight compared to other IDEs
- 🎨 **Dark, light and custom themes** - Fully customizable themes!

### Current development state 🖥️

NQ-Studio is still under development, we don't recommend you use it for now, because some features are under development, like:

- Image preview

But if you don't mind that, you can use the IDE :)

### Changelog 🎯
NQ-Studio is now in the '0.1.0-alpha' version! To see the changes check: [CHANGELOG.md](./CHANGELOG.md)

--- 

### How to use the source code?

To use the NQ-Studio source code for what you want, you will need to execute some commands in your terminal:

```bash
make install-deps
```

This command installs all the dependencies that NQ-Studio needs to work, because the directory `node_modules` is not included in this project repository

```bash
make
# or
make all
```

This command executes other three steps:

- `make distclean` : Removes the `dist` directory, good for clean old builds.

- `make build` : Compiles all the TypeScript(which is not included :0) into JavaScript(which is included!) and copies essential files to the `dist` directory.

- `make preview` : Launches **Electron** and opens the IDE.

---

### Notes 📋
This project is under development and may contain bugs or have incomplete features