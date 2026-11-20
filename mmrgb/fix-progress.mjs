import fs from "fs";
let content = fs.readFileSync("C:/Users/Lenovo/Downloads/Documents/hobbyvcode/mmrgb/src/screens/ProgressScreen.tsx", "utf8");
// Fix unused variable i in map - find any remaining (entry, i) patterns
content = content.replace(
  /bodyWeightHistory\.map\(\(entry, i\) => \{/g,
  "bodyWeightHistory.map((entry, _i) => {"
);
fs.writeFileSync("C:/Users/Lenovo/Downloads/Documents/hobbyvcode/mmrgb/src/screens/ProgressScreen.tsx", content);
console.log("ProgressScreen.tsx fixed");
