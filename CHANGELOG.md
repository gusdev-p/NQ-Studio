# Changelog 📝

## 0.7.2-alpha

### UX Update

### What was added? ✨

- 💻 `JSON and JSONC LSP Support` : Now you have basic errors and warnings provided by the LSP!

- 📄 `Editor UX` : Custom font support added, better autocomplete and Jump To Reference added. Tiny note for you reader: I practically re-write two-thirds of the editor original code... So please, use and abuse of the editor ;)

- 🖼️ `New Icons` : New icons for directories and buttons = more stylish 😎

- 🖱️ `New Buttons` : Now you can toggle your sidebars and your terminal without using keyboard shortcuts! But don't worry, you can still use them too ;)

### Changes 🔧

- ▶️ `FileBar -> RunBar` : The old and somewhat useless **fileBar** was re-designed to the brand-new **runBar**! It can now execute your code and open previews. However, the reload and stop buttons are still under development ;)

### Bug fixes 👾

- ⌨️ `Tab Bug` : basically when you press tab with a suggestion, the suggestion is denied and the tab is added. Now is the inverse 😎

- 📋 `Properties Tab in TreeView` : The tab simply didn't want to appear... I made it appear ;)

- 📄 `Makefile Variables` : Some lines were not interpreted as variables, just because it has a simple `:`... Yeah, but now it recognizes!

- 📄 `Makefile Path` : When you open the **Makefile Tab** the path was duplicated, so the IDE says that the file don't exists... The paths are no longer duplicated ;)

### Incomplete features 🚧

- ▶️ `RunBar` : Some aspects and buttons need utility, and some APIs need to be created to the **runBar** work well.

### What to expect 👀

Most likely, the next update probably will be the `Git Update`! As the name suggests, it will introduce basic or possibly full Git support :)

### Notes 📋

NQ-Studio is under development, so some features mentioned in \`What was added?\` may be incomplete or may not work correctly.