const fs = require("fs");
const html = fs.readFileSync("/tmp/error.html", "utf8");
const match = html.match(/data-next-error-stack="(.*?)"/);
if (match) {
  console.log(match[1].replace(/&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#x2F;/g, "/").replace(/\\n/g, "\n"));
} else {
  console.log("No stack found.");
}
