import fs from "fs";
let content = fs.readFileSync("C:/Users/Lenovo/Downloads/Documents/hobbyvcode/mmrgb/src/store/index.ts", "utf8");
// Fix unused variable i in map
content = content.replace(
  "({ sets: e.sets.length, reps: e.sets[0]?.reps || 0, weight: e.sets[0]?.weight || 0 })) || []",
  "({ sets: e.sets.length, reps: e.sets[0]?.reps || 0, weight: e.sets[0]?.weight || 0 })) || []"
);
// Fix the i in the map callback
content = content.replace(
  "Array.from({ length: ex.targetSets }, (_, i) => ({ reps: ex.targetReps, weight: ex.targetWeight, completed: false }))",
  "Array.from({ length: ex.targetSets }, () => ({ reps: ex.targetReps, weight: ex.targetWeight, completed: false }))"
);
fs.writeFileSync("C:/Users/Lenovo/Downloads/Documents/hobbyvcode/mmrgb/src/store/index.ts", content);
console.log("store/index.ts fixed");
