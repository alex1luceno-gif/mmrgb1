import React, { useState, useMemo } from "react"
import { useStore } from "../store"
import { Card } from "../components/Card"
import { Button } from "../components/Button"
import { Input } from "../components/Input"
import { Modal } from "../components/Modal"
import { Tabs } from "../components/Tabs"
import { Select } from "../components/Select"
import { Plus, Trash2, Utensils, BookOpen, Search, Copy } from "lucide-react"

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

const COMMON_FOODS = [
  { name: "Chicken Breast", calories: 165, protein: 31, carbs: 0, fats: 3.6, serving: "100g", servingSize: "100g" },
  { name: "Salmon", calories: 208, protein: 20, carbs: 0, fats: 13, serving: "100g", servingSize: "100g" },
  { name: "Eggs", calories: 155, protein: 13, carbs: 1.1, fats: 11, serving: "100g (2 large)", servingSize: "100g" },
  { name: "Greek Yogurt 0%", calories: 59, protein: 10, carbs: 3.6, fats: 0.4, serving: "100g", servingSize: "100g" },
  { name: "Rice (cooked)", calories: 130, protein: 2.7, carbs: 28, fats: 0.3, serving: "100g", servingSize: "100g" },
  { name: "Oats", calories: 389, protein: 16.9, carbs: 66, fats: 6.9, serving: "100g", servingSize: "100g" },
  { name: "Sweet Potato", calories: 86, protein: 1.6, carbs: 20, fats: 0.1, serving: "100g", servingSize: "100g" },
  { name: "Broccoli", calories: 34, protein: 2.8, carbs: 7, fats: 0.4, serving: "100g", servingSize: "100g" },
  { name: "Avocado", calories: 160, protein: 2, carbs: 9, fats: 15, serving: "100g", servingSize: "100g" },
  { name: "Whey Protein", calories: 120, protein: 24, carbs: 3, fats: 1.5, serving: "1 scoop (30g)", servingSize: "30g" },
  { name: "Banana", calories: 89, protein: 1.1, carbs: 23, fats: 0.3, serving: "1 medium", servingSize: "1 medium" },
  { name: "Peanut Butter", calories: 588, protein: 25, carbs: 20, fats: 50, serving: "100g", servingSize: "100g" }
]

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const

type FoodEntryType = {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fats: number
  servingSize: string
  timestamp: Date
  mealType: "breakfast" | "lunch" | "dinner" | "snack"
}

export const NutritionScreen: React.FC = () => {
  const { foodEntries, mealPresets, targets, addFoodEntry, deleteFoodEntry, addMealPreset, deleteMealPreset } = useStore()
  const [activeTab, setActiveTab] = useState<"log" | "presets">("log")
  const [showFoodModal, setShowFoodModal] = useState(false)
  const [showPresetModal, setShowPresetModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState<FoodEntryType | null>(null)
  const [foodForm, setFoodForm] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
    servingSize: "100g",
    mealType: "lunch" as "breakfast" | "lunch" | "dinner" | "snack"
  })
  const [presetForm, setPresetForm] = useState({
    name: "",
    entries: [] as FoodEntryType[]
  })
  const [searchQuery, setSearchQuery] = useState("")

  const todaysEntries = useMemo(() => {
    const today = new Date().toDateString();
    return foodEntries.filter(e => safeToDate(e.timestamp).toDateString() === today);
  }, [foodEntries])

  const groupedEntries = MEAL_TYPES.map(type => ({ type, entries: todaysEntries.filter(e => e.mealType === type) }))
  const totalCalories = todaysEntries.reduce((sum, e) => sum + toNum(e.calories), 0)
  const totalProtein = todaysEntries.reduce((sum, e) => sum + toNum(e.protein), 0)
  const totalCarbs = todaysEntries.reduce((sum, e) => sum + toNum(e.carbs), 0)
  const totalFats = todaysEntries.reduce((sum, e) => sum + toNum(e.fats), 0)

  const openFoodModal = (entry?: FoodEntryType) => {
    if (entry) {
      setEditingEntry(entry)
      setFoodForm({
        name: entry.name,
        calories: entry.calories.toString(),
        protein: entry.protein.toString(),
        carbs: entry.carbs.toString(),
        fats: entry.fats.toString(),
        servingSize: entry.servingSize,
        mealType: entry.mealType
      })
    } else {
      setEditingEntry(null)
      setFoodForm({ name: "", calories: "", protein: "", carbs: "", fats: "", servingSize: "100g", mealType: "lunch" })
    }
    setShowFoodModal(true)
  }

  const handleFoodSubmit = () => {
    const entry = {
      id: editingEntry?.id || crypto.randomUUID(),
      name: foodForm.name,
      calories: toNum(foodForm.calories),
      protein: toNum(foodForm.protein),
      carbs: toNum(foodForm.carbs),
      fats: toNum(foodForm.fats),
      servingSize: foodForm.servingSize,
      timestamp: new Date(),
      mealType: foodForm.mealType
    }
    addFoodEntry(entry)
    setShowFoodModal(false)
  }

  const handleQuickAdd = (food: typeof COMMON_FOODS[0], mealType: "breakfast" | "lunch" | "dinner" | "snack") => {
    addFoodEntry({ id: crypto.randomUUID(), ...food, timestamp: new Date(), mealType })
  }

  const handlePresetSubmit = () => {
    if (presetForm.name && presetForm.entries.length > 0) {
      addMealPreset({ id: crypto.randomUUID(), name: presetForm.name, entries: presetForm.entries })
      setPresetForm({ name: "", entries: [] })
      setShowPresetModal(false)
    }
  }

  const addPresetEntry = (food: typeof COMMON_FOODS[0]) => {
    setPresetForm(prev => ({ ...prev, entries: [...prev.entries, { ...food, id: crypto.randomUUID(), timestamp: new Date(), mealType: "lunch" as const }] }))
  }

  const removePresetEntry = (index: number) => {
    setPresetForm(prev => ({ ...prev, entries: prev.entries.filter((_, i) => i !== index) }))
  }

  const filteredFoods = COMMON_FOODS.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="min-h-screen bg-mmrgb-bg">
      <header className="sticky top-0 z-40 bg-mmrgb-bg/80 backdrop-blur-xl border-b border-mmrgb-border">
        <div className="p-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-mmrgb-text">Nutrition</h1>
          <Button onClick={() => openFoodModal()} size="sm" className="gap-1">
            <Plus className="w-4 h-4" /> Log Food
          </Button>
        </div>
        <Tabs tabs={[
          { id: "log", label: "Today", icon: <Utensils className="w-4 h-4" />, count: todaysEntries.length },
          { id: "presets", label: "Presets", icon: <BookOpen className="w-4 h-4" />, count: mealPresets.length }
        ]} activeTab={activeTab} onChange={(id: string) => setActiveTab(id as "log" | "presets")} variant="pills" className="px-4 pb-4" />
      </header>
      <div className="p-4 pb-40 space-y-4">
        {activeTab === "log" && (
          <>
            <Card padding="lg">
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="bg-mmrgb-surfaceElevated rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-mmrgb-primary">{totalCalories}</p>
                  <p className="text-xs text-mmrgb-textMuted">Calories</p>
                </div>
                <div className="bg-mmrgb-surfaceElevated rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-mmrgb-secondary">{totalProtein}g</p>
                  <p className="text-xs text-mmrgb-textMuted">Protein</p>
                </div>
                <div className="bg-mmrgb-surfaceElevated rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-mmrgb-warning">{totalCarbs}g</p>
                  <p className="text-xs text-mmrgb-textMuted">Carbs</p>
                </div>
                <div className="bg-mmrgb-surfaceElevated rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-mmrgb-danger">{totalFats}g</p>
                  <p className="text-xs text-mmrgb-textMuted">Fats</p>
                </div>
              </div>
              {targets && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-mmrgb-surfaceElevated rounded-xl p-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-mmrgb-textMuted">Calories</span>
                      <span className="text-mmrgb-text font-medium">{totalCalories} / {targets.calories}</span>
                    </div>
                    <div className="h-2 bg-mmrgb-border rounded-full overflow-hidden">
                      <div className="h-full bg-mmrgb-primary rounded-full transition-all" style={{ width: Math.min(totalCalories / (targets.calories || 1), 1) * 100 + "%" }} />
                    </div>
                  </div>
                  <div className="bg-mmrgb-surfaceElevated rounded-xl p-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-mmrgb-textMuted">Protein</span>
                      <span className="text-mmrgb-text font-medium">{totalProtein} / {targets.protein}g</span>
                    </div>
                    <div className="h-2 bg-mmrgb-border rounded-full overflow-hidden">
                      <div className="h-full bg-mmrgb-secondary rounded-full transition-all" style={{ width: Math.min(totalProtein / (targets.protein || 1), 1) * 100 + "%" }} />
                    </div>
                  </div>
                </div>
              )}
            </Card>
            <div className="space-y-4">
              {groupedEntries.map(({ type, entries }) =>
                entries.length > 0 && (
                  <Card key={type} padding="md">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-mmrgb-text capitalize">{type}</h3>
                      <p className="text-sm text-mmrgb-textMuted">{entries.reduce((sum, e) => sum + toNum(e.calories), 0)} cal</p>
                    </div>
                    <div className="space-y-2">
                      {entries.map(entry => (
                        <div key={entry.id} className="flex items-center gap-3 p-3 bg-mmrgb-surfaceElevated rounded-xl">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-mmrgb-text truncate">{entry.name}</p>
                            <p className="text-xs text-mmrgb-textMuted">{entry.servingSize} \u00b7 P: {toNum(entry.protein)}g C: {toNum(entry.carbs)}g F: {toNum(entry.fats)}g</p>
                          </div>
                          <p className="text-sm font-medium text-mmrgb-text text-nowrap">{toNum(entry.calories)} cal</p>
                          <button onClick={() => deleteFoodEntry(entry.id)} className="p-2 text-mmrgb-textMuted hover:text-mmrgb-danger hover:bg-mmrgb-surface rounded-xl transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </Card>
                )
              )}
              {todaysEntries.length === 0 && (
                <Card padding="lg" className="text-center">
                  <Utensils className="w-12 h-12 text-mmrgb-textDim mx-auto mb-4" />
                  <p className="text-mmrgb-textMuted">No food logged today</p>
                  <Button onClick={() => openFoodModal()} className="mt-4 w-auto">
                    <Plus className="w-4 h-4" /> Log First Meal
                  </Button>
                </Card>
              )}
            </div>
          </>
        )}
        {activeTab === "presets" && (
          <>
            {mealPresets.length === 0 ? (
              <Card padding="lg" className="text-center">
                <BookOpen className="w-12 h-12 text-mmrgb-textDim mx-auto mb-4" />
                <p className="text-mmrgb-textMuted mb-4">No meal presets saved</p>
                <Button onClick={() => setShowPresetModal(true)}>
                  <Plus className="w-4 h-4" /> Create Preset
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {mealPresets.map(preset => {
                  const presetCalories = preset.entries.reduce((sum, e) => sum + toNum(e.calories), 0)
                  const presetProtein = preset.entries.reduce((sum, e) => sum + toNum(e.protein), 0)
                  return (
                    <Card key={preset.id} padding="md">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-mmrgb-text">{preset.name}</h3>
                          <p className="text-sm text-mmrgb-textMuted">{preset.entries.length} items \u00b7 {presetCalories} cal \u00b7 {presetProtein}g protein</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => {
                            preset.entries.forEach(e => addFoodEntry({ id: crypto.randomUUID(), ...e, timestamp: new Date(), mealType: "lunch" }))
                          }}>
                            <Copy className="w-4 h-4" /> Add to Today
                          </Button>
                          <button onClick={() => deleteMealPreset(preset.id)} className="p-2 text-mmrgb-textMuted hover:text-mmrgb-danger hover:bg-mmrgb-surface rounded-xl transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {preset.entries.map((entry, i) => (
                          <span key={i} className="px-3 py-1 bg-mmrgb-surfaceElevated rounded-full text-xs text-mmrgb-textMuted">{entry.name}</span>
                        ))}
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
            <Button onClick={() => setShowPresetModal(true)} fullWidth variant="secondary" className="mt-4">
              <Plus className="w-4 h-4" /> Create New Preset
            </Button>
          </>
        )}
      </div>
      <Modal isOpen={showFoodModal} onClose={() => setShowFoodModal(false)} title={editingEntry ? "Edit Food" : "Log Food"} size="lg">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="mb-4">
            <label className="block text-sm font-medium text-mmrgb-textMuted mb-2">Search Common Foods</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mmrgb-textDim" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search foods..." className="w-full pl-10 pr-4 py-3 bg-mmrgb-surfaceElevated border border-mmrgb-border rounded-xl text-mmrgb-text placeholder-mmrgb-textDim focus:outline-none focus:ring-2 focus:ring-mmrgb-primary/30" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {filteredFoods.map(food => (
              <button key={food.name} onClick={() => handleQuickAdd(food, foodForm.mealType)} className="p-3 bg-mmrgb-surfaceElevated border border-mmrgb-border rounded-xl text-left hover:border-mmrgb-textMuted transition-colors">
                <p className="font-medium text-mmrgb-text text-sm">{food.name}</p>
                <p className="text-xs text-mmrgb-textMuted">{food.serving} \u00b7 {food.calories}cal \u00b7 {food.protein}g P</p>
              </button>
            ))}
          </div>
          <div className="border-t border-mmrgb-border pt-4">
            <p className="text-sm font-medium text-mmrgb-textMuted mb-3">Or Add Custom</p>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Name" value={foodForm.name} onChange={e => setFoodForm({ ...foodForm, name: e.target.value })} placeholder="Chicken Breast" />
              <Select label="Meal" value={foodForm.mealType} onChange={(v: string) => setFoodForm({ ...foodForm, mealType: v as typeof foodForm.mealType })} options={MEAL_TYPES.map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))} />
            </div>
            <div className="grid grid-cols-4 gap-3">
              <Input label="Calories" type="number" value={foodForm.calories} onChange={e => setFoodForm({ ...foodForm, calories: e.target.value || "" })} placeholder="165" min="0" />
              <Input label="Protein (g)" type="number" value={foodForm.protein} onChange={e => setFoodForm({ ...foodForm, protein: e.target.value || "" })} placeholder="31" step="0.1" min="0" />
              <Input label="Carbs (g)" type="number" value={foodForm.carbs} onChange={e => setFoodForm({ ...foodForm, carbs: e.target.value || "" })} placeholder="0" step="0.1" min="0" />
              <Input label="Fats (g)" type="number" value={foodForm.fats} onChange={e => setFoodForm({ ...foodForm, fats: e.target.value || "" })} placeholder="3.6" step="0.1" min="0" />
            </div>
            <Input label="Serving Size" value={foodForm.servingSize} onChange={e => setFoodForm({ ...foodForm, servingSize: e.target.value })} placeholder="100g" />
            <Button onClick={handleFoodSubmit} fullWidth disabled={!foodForm.name || !foodForm.calories}>
              {editingEntry ? "Save Changes" : "Log Food"}
            </Button>
          </div>
        </div>
      </Modal>
      <Modal isOpen={showPresetModal} onClose={() => setShowPresetModal(false)} title="Create Meal Preset" size="lg">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <Input label="Preset Name" value={presetForm.name} onChange={e => setPresetForm({ ...presetForm, name: e.target.value })} placeholder="Post-Workout Shake" />
          <div>
            <label className="block text-sm font-medium text-mmrgb-textMuted mb-2">Foods in Preset</label>
            {presetForm.entries.length === 0 ? (
              <p className="text-sm text-mmrgb-textDim text-center py-4">No foods added yet</p>
            ) : (
              <div className="space-y-2">
                {presetForm.entries.map((entry, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-mmrgb-surfaceElevated rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-mmrgb-text text-sm">{entry.name}</p>
                      <p className="text-xs text-mmrgb-textMuted">{entry.servingSize} \u00b7 P: {toNum(entry.protein)}g C: {toNum(entry.carbs)}g F: {toNum(entry.fats)}g</p>
                    </div>
                    <p className="text-sm font-medium text-mmrgb-text">{toNum(entry.calories)} cal</p>
                    <button onClick={() => removePresetEntry(i)} className="p-2 text-mmrgb-textMuted hover:text-mmrgb-danger hover:bg-mmrgb-surface rounded-xl transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="border-t border-mmrgb-border pt-4">
            <p className="text-sm font-medium text-mmrgb-textMuted mb-3">Add Foods</p>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {COMMON_FOODS.map(food => (
                <button key={food.name} onClick={() => addPresetEntry(food)} className="p-3 bg-mmrgb-surfaceElevated border border-mmrgb-border rounded-xl text-left hover:border-mmrgb-textMuted transition-colors">
                  <p className="font-medium text-mmrgb-text text-sm">{food.name}</p>
                  <p className="text-xs text-mmrgb-textMuted">{food.serving} \u00b7 {food.calories}cal \u00b7 {food.protein}g P</p>
                </button>
              ))}
            </div>
          </div>
          <Button onClick={handlePresetSubmit} fullWidth disabled={!presetForm.name || presetForm.entries.length === 0}>Save Preset</Button>
        </div>
      </Modal>
    </div>
  )
}
