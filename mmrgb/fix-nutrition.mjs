import fs from "fs";
let content = fs.readFileSync("C:/Users/Lenovo/Downloads/Documents/hobbyvcode/mmrgb/src/screens/NutritionScreen.tsx", "utf8");
// Fix onChange type for Tabs - need to cast the string to the expected type
content = content.replace(
  "onChange={setActiveTab}",
  "onChange={(id: string) => setActiveTab(id as \"log\" | \"presets\")}"
);
fs.writeFileSync("C:/Users/Lenovo/Downloads/Documents/hobbyvcode/mmrgb/src/screens/NutritionScreen.tsx", content);
console.log("NutritionScreen.tsx fixed");
