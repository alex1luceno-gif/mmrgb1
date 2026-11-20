import fs from 'fs';
const path = 'C:\\Users\\Lenovo\\Downloads\\Documents\\hobbyvcode\\mmrgb\\src\\screens\\NutritionScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldLine = '        <Tabs tabs={[';
const newLine = '        <Tabs tabs={[';

// Fix the onChange type
content = content.replace('onChange={(v: \"log\" | \"presets\") => setActiveTab(v)}', 'onChange={(id: string) => setActiveTab(id as \"log\" | \"presets\")}');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed!');
