const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", "js/main.js");
const t = fs.readFileSync(p, "utf8");
const i = t.indexOf('if (state === "title")');
const j = t.indexOf("G.notebook.isOpen()");
console.log("slice from", i, "to", j);
console.log(JSON.stringify(t.slice(i - 40, j)));
