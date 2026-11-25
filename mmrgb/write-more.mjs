import fs from "fs";

// NutritionScreen.tsx - fix the template literal issues
const nutritionContent = `import React, { useState, useEffect } from "react"
import { useStore } from "../store"
import { Card } from "../components/Card"
import { Button } from "../components/Button"
import { Input } from "../components/Input"
import { Modal } from "../components/Modal"
import { Tabs } from "../components/Tabs"
import { Plus, Trash2, Edit, Utensils, BookOpen, Search, X, ChevronDown, Copy } from "lucide-react"
import { clsx } from "clsx"
import { formatDateDisplay } from "../utils/calculations"

const COMMON_FOODS = [
  { name: "Chicken Breast", calories: 165, protein: 31, carbs: 0, fats: 3.6, serving: "100g" },
  { name: "Salmon", calories: 208, protein: 20, carbs: 0, fats: 13, serving: "100g" },
  { name: "Eggs", calories: 155, protein: 13, carbs: 1.1, fats: 11, serving: "100g (2 large)" },
  { name: "Greek Yogurt 0%", calories: 59, protein: 10, carbs: 3.6, fats: 0.4, serving: "100g" },
  { name: "Rice (cooked)", calories: 130, protein: 2.7, carbs: 28, fats: 0.3, serving: "100g" },
  { name: "Oats", calories: 389, protein: 16.9, carbs: 66, fats: 6.9, serving: "100g" },
  { name: "Sweet Potato", calories: 86, protein: 1.6, carbs: 20, fats: 0.1, serving: "100g" },
  { name: "Broccoli", calories: 34, protein: 2.8, carbs: 7, fats: 0.4, serving: "100g" },
  { name: "Avocado", calories: 160, protein: 2, carbs: 9, fats: 15, serving: "100g" },
  { name: "Whey Protein", calories: 120, protein: 24, carbs: 3, fats: 1.5, serving: "1 scoop (30g)" },
  { name: "Banana", calories: 89, protein: 1.1, carbs: 23, fats: 0.3, serving: "1 medium" },
  { name: "Peanut Butter", calories: 588, protein: 25, carbs: 20, fats: 50, serving: "100g" }
]

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const

export const NutritionScreen: React.FC = () => {
  const { foodEntries, mealPresets, targets, addFoodEntry, deleteFoodEntry, addMealPreset, deleteMealPreset, getDailyLog, currentScreen, setScreen } = useStore()
  const [activeTab, setActiveTab] = useState<"log" | "presets">("log")
  const [showFoodModal, setShowFoodModal] = useState(false)
  const [showPresetModal, setShowPresetModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState<typeof foodEntries[0] | null>(null)
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
    entries: [] as typeof foodEntries
  })
  const [searchQuery, setSearchQuery] = useState("")

  const todaysEntries = foodEntries.filter(e => e.timestamp.toDateString() === new Date().toDateString())
  const groupedEntries = MEAL_TYPES.map(type => ({ type, entries: todaysEntries.filter(e => e.mealType === type) }))
  const totalCalories = todaysEntries.reduce((sum, e) => sum + e.calories, 0)
  const totalProtein = todaysEntries.reduce((sum, e) => sum + e.protein, 0)
  const totalCarbs = todaysEntries.reduce((sum, e) => sum + e.carbs, 0)
  const totalFats = todaysEntries.reduce((sum, e) => sum + e.fats, 0)

  const openFoodModal = (entry?: typeof foodEntries[0]) => {
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
      id: editingEntry?.id || Date.now().toString(),
      name: foodForm.name,
      calories: Number(foodForm.calories),
      protein: Number(foodForm.protein),
      carbs: Number(foodForm.carbs),
      fats: Number(foodForm.fats),
      servingSize: foodForm.servingSize,
      timestamp: new Date(),
      mealType: foodForm.mealType
    }
    addFoodEntry(entry)
    setShowFoodModal(false)
  }

  const handleQuickAdd = (food: typeof COMMON_FOODS[0], mealType: "breakfast" | "lunch" | "dinner" | "snack") => {
    addFoodEntry({ id: Date.now().toString(), ...food, timestamp: new Date(), mealType })
  }

  const handlePresetSubmit = () => {
    if (presetForm.name && presetForm.entries.length > 0) {
      addMealPreset({ id: Date.now().toString(), name: presetForm.name, entries: presetForm.entries })
      setPresetForm({ name: "", entries: [] })
      setShowPresetModal(false)
    }
  }

  const addPresetEntry = (food: typeof COMMON_FOODS[0]) => {
    setPresetForm(prev => ({ ...prev, entries: [...prev.entries, { ...food, mealType: "lunch" as const }] }))
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
        ]} activeTab={activeTab} onChange={setActiveTab} variant="pills" className="px-4 pb-4" />
      </header>
      <div className="p-4 pb-28 space-y-4">
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
                      <div className="h-full bg-mmrgb-primary rounded-full transition-all" style={{ width: \`\${Math.min(totalCalories / targets.calories, 1) * 100}%\` }} />
                    </div>
                  </div>
                  <div className="bg-mmrgb-surfaceElevated rounded-xl p-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-mmrgb-textMuted">Protein</span>
                      <span className="text-mmrgb-text font-medium">{totalProtein} / {targets.protein}g</span>
                    </div>
                    <div className="h-2 bg-mmrgb-border rounded-full overflow-hidden">
                      <div className="h-full bg-mmrgb-secondary rounded-full transition-all" style={{ width: \`\${Math.min(totalProtein / targets.protein, 1) * 100}%\` }} />
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
                      <p className="text-sm text-mmrgb-textMuted">{entries.reduce((sum, e) => sum + e.calories, 0)} cal</p>
                    </div>
                    <div className="space-y-2">
                      {entries.map(entry => (
                        <div key={entry.id} className="flex items-center gap-3 p-3 bg-mmrgb-surfaceElevated rounded-xl">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-mmrgb-text truncate">{entry.name}</p>
                            <p className="text-xs text-mmrgb-textMuted">{entry.servingSize} \u2022 P: {entry.protein}g C: {entry.carbs}g F: {entry.fats}g</p>
                          </div>
                          <p className="text-sm font-medium text-mmrgb-text text-nowrap">{entry.calories} cal</p>
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
                  const presetCalories = preset.entries.reduce((sum, e) => sum + e.calories, 0)
                  const presetProtein = preset.entries.reduce((sum, e) => sum + e.protein, 0)
                  return (
                    <Card key={preset.id} padding="md">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-mmrgb-text">{preset.name}</h3>
                          <p className="text-sm text-mmrgb-textMuted">{preset.entries.length} items \u2022 {presetCalories} cal \u2022 {presetProtein}g protein</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => {
                            preset.entries.forEach(e => addFoodEntry({ id: Date.now().toString() + Math.random(), ...e, timestamp: new Date(), mealType: "lunch" }))
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
                <p className="text-xs text-mmrgb-textMuted">{food.serving} \u2022 {food.calories}cal \u2022 {food.protein}g P</p>
              </button>
            ))}
          </div>
          <div className="border-t border-mmrgb-border pt-4">
            <p className="text-sm font-medium text-mmrgb-textMuted mb-3">Or Add Custom</p>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Name" value={foodForm.name} onChange={e => setFoodForm({ ...foodForm, name: e.target.value })} placeholder="Chicken Breast" />
              <Select label="Meal" value={foodForm.mealType} onChange={v => setFoodForm({ ...foodForm, mealType: v as typeof foodForm.mealType })} options={MEAL_TYPES.map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))} />
            </div>
            <div className="grid grid-cols-4 gap-3">
              <Input label="Calories" type="number" value={foodForm.calories} onChange={e => setFoodForm({ ...foodForm, calories: e.target.value })} placeholder="165" />
              <Input label="Protein (g)" type="number" value={foodForm.protein} onChange={e => setFoodForm({ ...foodForm, protein: e.target.value })} placeholder="31" step="0.1" />
              <Input label="Carbs (g)" type="number" value={foodForm.carbs} onChange={e => setFoodForm({ ...foodForm, carbs: e.target.value })} placeholder="0" step="0.1" />
              <Input label="Fats (g)" type="number" value={foodForm.fats} onChange={e => setFoodForm({ ...foodForm, fats: e.target.value })} placeholder="3.6" step="0.1" />
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
                      <p className="text-xs text-mmrgb-textMuted">{entry.servingSize} \u2022 P: {entry.protein}g C: {entry.carbs}g F: {entry.fats}g</p>
                    </div>
                    <p className="text-sm font-medium text-mmrgb-text">{entry.calories} cal</p>
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
                  <p className="text-xs text-mmrgb-textMuted">{food.serving} \u2022 {food.calories}cal \u2022 {food.protein}g P</p>
                </button>
              ))}
            </div>
          </div>
          <Button onClick={handlePresetSubmit} fullWidth disabled={!presetForm.name || presetForm.entries.length === 0}>Save Preset</Button>
        </div>
      </Modal>
    </div>
  )
}`;
fs.writeFileSync("src/screens/NutritionScreen.tsx", nutritionContent);
console.log("NutritionScreen.tsx written");

// OnboardingScreen.tsx - fix the gender button issue
const onboardingContent = `import React, { useState } from "react"
import { useStore } from "../store"
import { Button } from "../components/Button"
import { Input } from "../components/Input"
import { Select } from "../components/Select"
import { Slider } from "../components/Slider"
import { Card } from "../components/Card"
import { ArrowRight, Dumbbell, Target, Users, Flame, Leaf } from "lucide-react"
import { clsx } from "clsx"

export const OnboardingScreen: React.FC = () => {
  const { setProfile, completeOnboarding } = useStore()
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState({
    height: 175,
    weight: 75,
    age: 25,
    gender: "male" as "male" | "female",
    activityLevel: "moderate" as "sedentary" | "light" | "moderate" | "very" | "extra",
    goal: "lean_bulk" as "lean_bulk" | "recomp" | "mini_cut"
  })

  const steps = [
    { title: "Body Stats", subtitle: "Tell us about yourself", icon: Users },
    { title: "Activity Level", subtitle: "How active are you?", icon: Flame },
    { title: "Goal", subtitle: "What are you working towards?", icon: Target }
  ]

  const activityOptions = [
    { value: "sedentary", label: "Sedentary", desc: "Little to no exercise" },
    { value: "light", label: "Light", desc: "Light exercise 1-3 days/week" },
    { value: "moderate", label: "Moderate", desc: "Moderate exercise 3-5 days/week" },
    { value: "very", label: "Very Active", desc: "Hard exercise 6-7 days/week" },
    { value: "extra", label: "Extra Active", desc: "Very hard exercise, physical job" }
  ]

  const goalOptions = [
    { value: "lean_bulk", label: "Lean Bulk", desc: "Build muscle, minimize fat gain", icon: Dumbbell, color: "#00ff88" },
    { value: "recomp", label: "Recomp", desc: "Build muscle & lose fat simultaneously", icon: Target, color: "#00d4ff" },
    { value: "mini_cut", label: "Mini Cut", desc: "Lose fat while preserving muscle", icon: Leaf, color: "#ffaa00" }
  ]

  const handleNext = () => {
    if (step < 2) { setStep(step + 1) }
    else { setProfile(formData); completeOnboarding() }
  }

  const handleBack = () => { if (step > 0) setStep(step - 1) }

  const isStepValid = () => {
    switch (step) {
      case 0: return formData.height > 0 && formData.weight > 0 && formData.age > 0
      case 1: return true
      case 2: return true
      default: return false
    }
  }

  return (
    <div className="min-h-screen bg-mmrgb-bg flex flex-col">
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-3">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={clsx(
                "w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold transition-all",
                i < step ? "bg-mmrgb-primary text-mmrgb-bg" :
                i === step ? "bg-mmrgb-primary/20 text-mmrgb-primary border border-mmrgb-primary" :
                "bg-mmrgb-surfaceElevated text-mmrgb-textMuted border border-mmrgb-border"
              )}>
                {i < step ? <ArrowRight className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
              </div>
              {i < steps.length - 1 && <div className={clsx("w-12 h-0.5 rounded", i < step ? "bg-mmrgb-primary" : "bg-mmrgb-border")} />}
            </div>
          ))}
        </div>
        <button onClick={handleBack} disabled={step === 0} className={clsx("p-2 rounded-xl text-mmrgb-textMuted hover:text-mmrgb-text hover:bg-mmrgb-surfaceElevated transition-colors", step === 0 && "invisible")}>
          <ArrowRight className="w-5 h-5 rotate-180" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-5 pb-24 animate-slide-up">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-mmrgb-text mb-1">{steps[step].title}</h1>
          <p className="text-mmrgb-textMuted mb-8">{steps[step].subtitle}</p>
          {step === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Height (cm)" type="number" value={formData.height} onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })} min={100} max={250} placeholder="175" />
                <Input label="Weight (kg)" type="number" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })} min={30} max={200} placeholder="75" />
              </div>
              <Input label="Age" type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })} min={13} max={100} placeholder="25" />
              <div>
                <label className="block text-sm font-medium text-mmrgb-textMuted mb-2">Gender</label>
                <div className="grid grid-cols-2 gap-3">
                  {["male", "female"].map((g) => (
                    <button key={g} type="button" onClick={() => setFormData({ ...formData, gender: g as "male" | "female" })} className={clsx(
                      "p-4 rounded-xl border-2 text-sm font-medium transition-all",
                      formData.gender === g ? "border-mmrgb-primary bg-mmrgb-primary/10 text-mmrgb-primary" : "border-mmrgb-border text-mmrgb-textMuted hover:border-mmrgb-textMuted"
                    )}>
                      {g === "male" ? "\u2642" : "\u2640"} {g.charAt(0).toUpperCase() + g.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-3">
              {activityOptions.map((opt) => (
                <button key={opt.value} type="button" onClick={() => setFormData({ ...formData, activityLevel: opt.value as typeof formData.activityLevel })} className={clsx(
                  "w-full p-4 rounded-xl border-2 text-left transition-all",
                  formData.activityLevel === opt.value ? "border-mmrgb-primary bg-mmrgb-primary/10" : "border-mmrgb-border hover:border-mmrgb-textMuted"
                )}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-mmrgb-text">{opt.label}</p>
                      <p className="text-sm text-mmrgb-textMuted">{opt.desc}</p>
                    </div>
                    {formData.activityLevel === opt.value && (
                      <svg className="w-5 h-5 text-mmrgb-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
          {step === 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {goalOptions.map((opt) => (
                <button key={opt.value} type="button" onClick={() => setFormData({ ...formData, goal: opt.value as typeof formData.goal })} className={clsx(
                  "p-5 rounded-2xl border-2 text-center transition-all relative overflow-hidden",
                  formData.goal === opt.value ? "border-mmrgb-primary bg-mmrgb-primary/10" : "border-mmrgb-border hover:border-mmrgb-textMuted"
                )} style={{ "--accent-color": opt.color }}>
                  <div className="relative z-10">
                    <div className={clsx("w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center",
                      formData.goal === opt.value ? "bg-mmrgb-primary text-mmrgb-bg" : "bg-mmrgb-surfaceElevated text-mmrgb-textMuted"
                    )} style={{ background: formData.goal === opt.value ? \`linear-gradient(135deg, \${opt.color} 0%, \${opt.color}cc 100%)\` : undefined }}>
                      <opt.icon className={clsx("w-6 h-6", formData.goal === opt.value ? "text-mmrgb-bg" : "text-mmrgb-textMuted")} />
                    </div>
                    <h3 className="font-bold text-mmrgb-text mb-1">{opt.label}</h3>
                    <p className="text-sm text-mmrgb-textMuted">{opt.desc}</p>
                  </div>
                  {formData.goal === opt.value && <div className="absolute inset-0 bg-gradient-to-br from-mmrgb-primary/20 to-transparent" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-mmrgb-bg to-transparent">
        <Button onClick={handleNext} disabled={!isStepValid()} fullWidth size="lg" className="mx-auto max-w-md">
          {step === 2 ? "Get Started" : "Continue"} <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}`;
fs.writeFileSync("src/screens/OnboardingScreen.tsx", onboardingContent);
console.log("OnboardingScreen.tsx written");

console.log("Files written!");
