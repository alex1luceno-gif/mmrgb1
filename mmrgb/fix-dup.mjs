import fs from 'fs';
const path = 'C:\\Users\\Lenovo\\Downloads\\Documents\\hobbyvcode\\mmrgb\\src\\screens\\NutritionScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

const duplicateLine = '        ]} activeTab={activeTab} onChange={(id: string) => setActiveTab(id as \"log\" | \"presets\")} variant=\"pills\" className=\"px-4 pb-4\" />';
content = content.replace(duplicateLine, '').trimEnd() + '\n';

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed!');
