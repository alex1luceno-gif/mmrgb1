import fs from 'fs';
const path = 'C:\\Users\\Lenovo\\Downloads\\Documents\\hobbyvcode\\mmrgb\\src\\screens\\NutritionScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add imports for useMemo and useCallback
content = content.replace(
  'import React, { useState } from \"react\"',
  'import React, { useState, useMemo } from \"react\"'
);

// Add safeToDate and toNum helper functions after the imports
const helperFunctions = 
// Safe date parsing - handles Date objects, ISO strings, timestamps, and invalid values
const safeToDate = (value: Date | string | number | null | undefined): Date => {
  if (value instanceof Date) return isNaN(value.getTime()) ? new Date() : value;
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
  }
  return new Date();
};

// Safe number conversion - returns 0 for NaN, empty, null, undefined
const toNum = (value: string | number | null | undefined): number => {
  if (value === '' || value === null || value === undefined) return 0;
  const n = Number(value);
  return isNaN(n) ? 0 : n;
};
;

content = content.replace(
  'import { Plus, Trash2, Utensils, BookOpen, Search, Copy } from \"lucide-react\"',
  'import { Plus, Trash2, Utensils, BookOpen, Search, Copy } from \"lucide-react\"' + helperFunctions
);

// Fix todaysEntries to use useMemo and safeToDate
content = content.replace(
  'const todaysEntries = foodEntries.filter(e => e.timestamp.toDateString() === new Date().toDateString())',
  'const todaysEntries = useMemo(() => {\n    const today = new Date().toDateString();\n    return foodEntries.filter(e => safeToDate(e.timestamp).toDateString() === today);\n  }, [foodEntries])'
);

// Fix totalCalories, totalProtein, totalCarbs, totalFats to use toNum
content = content.replace(
  'const totalCalories = todaysEntries.reduce((sum, e) => sum + e.calories, 0)',
  'const totalCalories = todaysEntries.reduce((sum, e) => sum + toNum(e.calories), 0)'
);

content = content.replace(
  'const totalProtein = todaysEntries.reduce((sum, e) => sum + e.protein, 0)',
  'const totalProtein = todaysEntries.reduce((sum, e) => sum + toNum(e.protein), 0)'
);

content = content.replace(
  'const totalCarbs = todaysEntries.reduce((sum, e) => sum + e.carbs, 0)',
  'const totalCarbs = todaysEntries.reduce((sum, e) => sum + toNum(e.carbs), 0)'
);

content = content.replace(
  'const totalFats = todaysEntries.reduce((sum, e) => sum + e.fats, 0)',
  'const totalFats = todaysEntries.reduce((sum, e) => sum + toNum(e.fats), 0)'
);

// Fix handleFoodSubmit to use crypto.randomUUID and toNum
content = content.replace(
  'const handleFoodSubmit = () => {\n    const entry = {\n      id: editingEntry?.id || Date.now().toString(),\n      name: foodForm.name,\n      calories: Number(foodForm.calories),\n      protein: Number(foodForm.protein),\n      carbs: Number(foodForm.carbs),\n      fats: Number(foodForm.fats),\n      servingSize: foodForm.servingSize,\n      timestamp: new Date(),\n      mealType: foodForm.mealType\n    }\n    addFoodEntry(entry)\n    setShowFoodModal(false)\n  }',
  'const handleFoodSubmit = () => {\n    const entry = {\n      id: editingEntry?.id || crypto.randomUUID(),\n      name: foodForm.name,\n      calories: toNum(foodForm.calories),\n      protein: toNum(foodForm.protein),\n      carbs: toNum(foodForm.carbs),\n      fats: toNum(foodForm.fats),\n      servingSize: foodForm.servingSize,\n      timestamp: new Date(),\n      mealType: foodForm.mealType\n    }\n    addFoodEntry(entry)\n    setShowFoodModal(false)\n  }'
);

// Fix handleQuickAdd to use crypto.randomUUID
content = content.replace(
  'const handleQuickAdd = (food: typeof COMMON_FOODS[0], mealType: \"breakfast\" | \"lunch\" | \"dinner\" | \"snack\") => {\n    addFoodEntry({ id: Date.now().toString(), ...food, timestamp: new Date(), mealType })\n  }',
  'const handleQuickAdd = (food: typeof COMMON_FOODS[0], mealType: \"breakfast\" | \"lunch\" | \"dinner\" | \"snack\") => {\n    addFoodEntry({ id: crypto.randomUUID(), ...food, timestamp: new Date(), mealType })\n  }'
);

// Fix handlePresetSubmit to use crypto.randomUUID
content = content.replace(
  'const handlePresetSubmit = () => {\n    if (presetForm.name && presetForm.entries.length > 0) {\n      addMealPreset({ id: Date.now().toString(), name: presetForm.name, entries: presetForm.entries })\n      setPresetForm({ name: \"\", entries: [] })\n      setShowPresetModal(false)\n    }\n  }',
  'const handlePresetSubmit = () => {\n    if (presetForm.name && presetForm.entries.length > 0) {\n      addMealPreset({ id: crypto.randomUUID(), name: presetForm.name, entries: presetForm.entries })\n      setPresetForm({ name: \"\", entries: [] })\n      setShowPresetModal(false)\n    }\n  }'
);

// Fix addPresetEntry to use crypto.randomUUID
content = content.replace(
  'const addPresetEntry = (food: typeof COMMON_FOODS[0]) => {\n    setPresetForm(prev => ({ ...prev, entries: [...prev.entries, { ...food, id: Date.now().toString(), timestamp: new Date(), mealType: \"lunch\" as const }] }))\n  }',
  'const addPresetEntry = (food: typeof COMMON_FOODS[0]) => {\n    setPresetForm(prev => ({ ...prev, entries: [...prev.entries, { ...food, id: crypto.randomUUID(), timestamp: new Date(), mealType: \"lunch\" as const }] }))\n  }'
);

// Fix number inputs to use e.target.value || \"\" and add min=\"0\"
content = content.replace(
  '<Input label=\"Calories\" type=\"number\" value={foodForm.calories} onChange={e => setFoodForm({ ...foodForm, calories: e.target.value })} placeholder=\"165\" />',
  '<Input label=\"Calories\" type=\"number\" value={foodForm.calories} onChange={e => setFoodForm({ ...foodForm, calories: e.target.value || \"\" })} placeholder=\"165\" min=\"0\" />'
);

content = content.replace(
  '<Input label=\"Protein (g)\" type=\"number\" value={foodForm.protein} onChange={e => setFoodForm({ ...foodForm, protein: e.target.value })} placeholder=\"31\" step=\"0.1\" />',
  '<Input label=\"Protein (g)\" type=\"number\" value={foodForm.protein} onChange={e => setFoodForm({ ...foodForm, protein: e.target.value || \"\" })} placeholder=\"31\" step=\"0.1\" min=\"0\" />'
);

content = content.replace(
  '<Input label=\"Carbs (g)\" type=\"number\" value={foodForm.carbs} onChange={e => setFoodForm({ ...foodForm, carbs: e.target.value })} placeholder=\"0\" step=\"0.1\" />',
  '<Input label=\"Carbs (g)\" type=\"number\" value={foodForm.carbs} onChange={e => setFoodForm({ ...foodForm, carbs: e.target.value || \"\" })} placeholder=\"0\" step=\"0.1\" min=\"0\" />'
);

content = content.replace(
  '<Input label=\"Fats (g)\" type=\"number\" value={foodForm.fats} onChange={e => setFoodForm({ ...foodForm, fats: e.target.value })} placeholder=\"3.6\" step=\"0.1\" />',
  '<Input label=\"Fats (g)\" type=\"number\" value={foodForm.fats} onChange={e => setFoodForm({ ...foodForm, fats: e.target.value || \"\" })} placeholder=\"3.6\" step=\"0.1\" min=\"0\" />'
);

// Fix progress bars to use division-by-zero protection
content = content.replace(
  'style={{ width: \"\" + Math.min(totalCalories / targets.calories, 1) * 100 + \"%\" }}',
  'style={{ width: Math.min(totalCalories / (targets.calories || 1), 1) * 100 + \"%\" }}'
);

content = content.replace(
  'style={{ width: \"\" + Math.min(totalProtein / targets.protein, 1) * 100 + \"%\" }}',
  'style={{ width: Math.min(totalProtein / (targets.protein || 1), 1) * 100 + \"%\" }}'
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed!');
