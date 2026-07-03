const fs = require("fs");

fs.cpSync("src/main", "dist/main", {recursive: true});
fs.cpSync("assets", "dist/assets", {recursive: true});