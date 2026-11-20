const fs = require("fs");
const content = fs.readFileSync("C:/Users/Lenovo/Downloads/Documents/hobbyvcode/mmrgb/src/screens/ProgressScreen.tsx", "utf8");
const lines = content.split("\n");
for (let i = 15; i < 25; i++) {
  console.log(i + 1 + ": " + lines[i]);
}
