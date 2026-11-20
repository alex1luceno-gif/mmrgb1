import fs from "fs";
let content = fs.readFileSync("C:/Users/Lenovo/Downloads/Documents/hobbyvcode/mmrgb/src/screens/DashboardScreen.tsx", "utf8");
// Add TrendingUp to imports
content = content.replace(
  "import { Plus, Check, Moon, Zap, Brain, Settings, Flame, Target } from \"lucide-react\"",
  "import { Plus, Check, Moon, Zap, Brain, Settings, Flame, Target, TrendingUp } from \"lucide-react\""
);
fs.writeFileSync("C:/Users/Lenovo/Downloads/Documents/hobbyvcode/mmrgb/src/screens/DashboardScreen.tsx", content);
console.log("DashboardScreen.tsx fixed");
