## NQ-Studio

<p align="center">
    <img src="./assets/logo.png" width="300">
</p>

A simple IDE for JavaScript, HTML, CSS and Node.js projects.

### Current development state

NQ-Studio is still under development, but it is already usable for simple projects involving JavaScript, HTML and CSS.

At the moment, the IDE does not yet include:
- Live HTML preview
- Image preview support

These features are planned for future updates.

---

### How to use the source code

To use the NQ-Studio source code, you will need to execute some commands in your terminal:

```Bash
make install-deps
```

This command installs all dependencies required by NQ-Studio when `node_modules` is not present in the project.

```Bash
make
# or
make all
```

This command runs three steps:
- `make distclean` : removes the `dist` directory and cleans previous builds

- `make build` : compiles TypeScript(which is not included!) into JavaScript and copies essential files

- `make preview` : starts **Electron** and opens the IDE.

---


### Notes

This project is envolving and may containg bugs or incomplete features. Feedback and suggestions are welcome.