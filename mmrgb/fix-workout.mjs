import fs from "fs";
let content = fs.readFileSync("C:/Users/Lenovo/Downloads/Documents/hobbyvcode/mmrgb/src/screens/WorkoutScreen.tsx", "utf8");
// Fix onChange type for Tabs
content = content.replace(
  "onChange={setActiveTab}",
  "onChange={(id: string) => setActiveTab(id as \"routines\" | \"active\" | \"create\")}"
);
fs.writeFileSync("C:/Users/Lenovo/Downloads/Documents/hobbyvcode/mmrgb/src/screens/WorkoutScreen.tsx", content);
console.log("WorkoutScreen.tsx fixed");
