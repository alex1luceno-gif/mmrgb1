const fs = require('fs');
const content = \import React, { useState } from "react"
import { useStore } from "../store"
import { ProgressRing } from "../components/ProgressRing"
import { Card } from "../components/Card"
import { Button } from "../components/Button"
import { Modal } from "../components/Modal"
import { Slider } from "../components/Slider"
import { Plus, Check, Moon, Zap, Brain, Settings, Flame, Target, TrendingUp, Droplet, Dumbbell } from "lucide-react"
import { formatDateDisplay } from "../utils/calculations"

export const DashboardScreen: React.FC = () => {
  const { 
    profile, targets, getTodaysCalories, getTodaysProtein, getTodaysWater, 
    isCreatineTakenToday, addCreatineEntry, addWaterEntry, addSleepEntry, 
    addSorenessEntry, setScreen, addFoodEntry, isWorkoutCompletedToday, getTodaysWorkout
  } = useStore()
  
  const [showSleepModal, setShowSleepModal] = useState(false)
  const [showSorenessModal, setShowSorenessModal] = useState(false)
  const [sleepHours, setSleepHours] = useState(7.5)
  const [sleepQuality, setSleepQuality] = useState(4)
  const [sorenessGroups, setSorenessGroups] = useState<string[]>([])
  const [readiness, setReadiness] = useState(75)
  const muscleGroups = ["Chest", "Back", "Shoulders", "Arms", "Legs", "Core"]

  const calorieProgress = targets ? Math.min(getTodaysCalories() / targets.calories, 1) : 0
  const proteinProgress = targets ? Math.min(getTodaysProtein() / targets.protein, 1) : 0
  const waterProgress = Math.min(getTodaysWater() / 3000, 1)

  const todayWorkout = getTodaysWorkout()
  const workoutCompleted = isWorkoutCompletedToday()

  // Quick add 25g protein (whey protein shake equivalent)
  const handleQuickAddProtein = () => {
    addFoodEntry({
      id: crypto.randomUUID(),
      name: "Whey Protein Shake",
      calories: 120,
      protein: 25,
      carbs: 3,
      fats: 1.5,
      servingSize: "1 scoop (30g)",
      timestamp: new Date(),
      mealType: "snack"
    })
  }
  
  const handleQuickAddWater = () => {
    addWaterEntry({ id: crypto.randomUUID(), amount: 500, date: new Date() })
  }
  
  const handleCreatineToggle = () => { 
    addCreatineEntry({ id: crypto.randomUUID(), taken: !isCreatineTakenToday(), date: new Date() }) 
  }
  
  const handleSleepSubmit = () => { 
    addSleepEntry({ id: crypto.randomUUID(), hours: sleepHours, quality: sleepQuality as 1|2|3|4|5, date: new Date() }); 
    setShowSleepModal(false) 
  }
  
  const handleSorenessSubmit = () => { 
    sorenessGroups.forEach(group => { 
      addSorenessEntry({ id: crypto.randomUUID(), muscleGroup: group, level: 3 as 1|2|3|4|5, date: new Date() }) 
    }); 
    setSorenessGroups([]); 
    setShowSorenessModal(false) 
  }
  
  const toggleSorenessGroup = (group: string) => { 
    setSorenessGroups(prev => prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]) 
  }

  if (!profile || !targets) return null

  return (
    <div className="min-h-screen bg-mmrgb-bg">
      <header className="sticky top-0 z-40 bg-mmrgb-bg/80 backdrop-blur-xl border-b border-mmrgb-border">
        <div className="p-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-mmrgb-text">MMRGB</h1>
            <p className="text-sm text-mmrgb-textMuted">{formatDateDisplay(new Date())}</p>
          </div>
          <button onClick={() => setScreen("settings")} className="p-3 rounded-xl text-mmrgb-textMuted hover:text-mmrgb-text hover:bg-mmrgb-surfaceElevated transition-colors">
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </header>
      <div className="p-4 pb-28 space-y-4">
        {/* Workout Status Card */}
        <Card padding="lg" className={workoutCompleted ? "border-2 border-mmrgb-primary/50 bg-mmrgb-primary/5" : ""}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-mmrgb-text flex items-center gap-2">
              <Dumbbell className="w-5 h-5" style={{ color: workoutCompleted ? "#00ff88" : "#888" }} />
              Today's Workout
            </h2>
            {workoutCompleted && (
              <span className="flex items-center gap-1 px-3 py-1 bg-mmrgb-primary/20 text-mmrgb-primary rounded-full text-sm font-medium">
                <Check className="w-4 h-4" /> Completed
              </span>
            )}
          </div>
          {workoutCompleted && todayWorkout ? (
            <div className="space-y-2">
              <p className="font-medium text-mmrgb-text">{todayWorkout.name}</p>
              <p className="text-sm text-mmrgb-textMuted">
                {todayWorkout.exercises.length} exercises • 
                {todayWorkout.exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0)} sets completed
              </p>
              <p className="text-xs text-mmrgb-textMuted">
                Finished at {todayWorkout.completedAt ? new Date(todayWorkout.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "today"}
              </p>
            </div>
          ) : (
            <p className="text-sm text-mmrgb-textMuted">No workout completed today. Tap a routine to start.</p>
          )}
        </Card>

        {/* Calorie & Protein Rings */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="relative overflow-hidden">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-mmrgb-textMuted">Daily Calories</p>
                <p className="text-2xl font-bold text-mmrgb-text tabular-nums">{getTodaysCalories()} / {targets.calories}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-mmrgb-primary/20 to-transparent rounded-xl flex items-center justify-center">
                <Flame className="w-7 h-7 text-mmrgb-primary" />
              </div>
            </div>
            <ProgressRing progress={calorieProgress} size={100} strokeWidth={8} color="#00ff88" bgColor="#2a2a2a">
              <div className="text-center">
                <p className="text-2xl font-bold text-mmrgb-text">{Math.round(calorieProgress * 100)}%</p>
                <p className="text-xs text-mmrgb-textMuted">of target</p>
              </div>
            </ProgressRing>
          </Card>
          <Card className="relative overflow-hidden">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-mmrgb-textMuted">Daily Protein</p>
                <p className="text-2xl font-bold text-mmrgb-text tabular-nums">{getTodaysProtein()} / {targets.protein}g</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-mmrgb-secondary/20 to-transparent rounded-xl flex items-center justify-center">
                <Target className="w-7 h-7 text-mmrgb-secondary" />
              </div>
            </div>
            <ProgressRing progress={proteinProgress} size={100} strokeWidth={8} color="#00d4ff" bgColor="#2a2a2a">
              <div className="text-center">
                <p className="text-2xl font-bold text-mmrgb-text">{Math.round(proteinProgress * 100)}%</p>
                <p className="text-xs text-mmrgb-textMuted">of target</p>
              </div>
            </ProgressRing>
          </Card>
        </div>
        
        {/* Quick Actions - Consistent sizing */}
        <Card padding="lg">
          <h2 className="text-lg font-bold text-mmrgb-text mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={handleQuickAddProtein} className="min-h-[96px] flex flex-col items-center justify-center gap-2 p-4">
              <Plus className="w-7 h-7" />
              <span className="text-base font-medium">+25g Protein</span>
            </Button>
            <Button variant="secondary" onClick={handleQuickAddWater} className="min-h-[96px] flex flex-col items-center justify-center gap-2 p-4">
              <Droplet className="w-7 h-7" />
              <span className="text-base font-medium">+500ml Water</span>
            </Button>
            <Button variant={isCreatineTakenToday() ? "primary" : "secondary"} onClick={handleCreatineToggle} className="min-h-[96px] flex flex-col items-center justify-center gap-2 p-4">
              <Check className="w-7 h-7" />
              <span className="text-base font-medium">{isCreatineTakenToday() ? "Creatine ?" : "Creatine"}</span>
            </Button>
            <Button variant="secondary" onClick={() => setShowSleepModal(true)} className="min-h-[96px] flex flex-col items-center justify-center gap-2 p-4">
              <Moon className="w-7 h-7" />
              <span className="text-base font-medium">Log Sleep</span>
            </Button>
          </div>
        </Card>
        
        {/* Readiness */}
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-mmrgb-text">Readiness</h2>
            <div className="flex items-center gap-2 text-sm text-mmrgb-textMuted">
              <Brain className="w-4 h-4" />
              <span>{readiness}%</span>
            </div>
          </div>
          <Slider label="How ready do you feel?" min={0} max={100} value={readiness} onChange={setReadiness} unit="%" />
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button onClick={() => setShowSorenessModal(true)} className="min-h-[60px] flex items-center justify-center gap-2 p-4 rounded-xl bg-mmrgb-surfaceElevated border border-mmrgb-border text-left transition-colors hover:border-mmrgb-textMuted">
              <Zap className="w-5 h-5 text-mmrgb-warning" />
              <span className="text-sm font-medium text-mmrgb-text">Soreness</span>
            </button>
            <div className="min-h-[60px] flex items-center justify-center gap-2 p-4 rounded-xl bg-mmrgb-surfaceElevated border border-mmrgb-border">
              <TrendingUp className="w-5 h-5 text-mmrgb-primary" />
              <span className="text-sm font-medium text-mmrgb-text">{readiness >= 70 ? "Ready to Train" : "Consider Recovery"}</span>
            </div>
          </div>
        </Card>
        
        {/* Water Intake */}
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-mmrgb-text">Water Intake</h2>
            <p className="text-sm text-mmrgb-textMuted">{getTodaysWater()} / 3000ml</p>
          </div>
          <ProgressRing progress={waterProgress} size={80} strokeWidth={6} color="#00d4ff" bgColor="#2a2a2a">
            <div className="text-center">
              <p className="text-xl font-bold text-mmrgb-text">{Math.round(waterProgress * 100)}%</p>
            </div>
          </ProgressRing>
          <div className="flex justify-center gap-2 mt-4 flex-wrap">
            {Array.from({ length: 6 }, (_, i) => (
              <button 
                key={i} 
                onClick={() => addWaterEntry({ id: crypto.randomUUID(), amount: 250, date: new Date() })} 
                className="w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all min-w-[48px] min-h-[48px]"
                style={{
                  background: i < Math.floor(getTodaysWater() / 250) ? "rgba(0, 212, 255, 0.15)" : "transparent",
                  borderColor: i < Math.floor(getTodaysWater() / 250) ? "#00d4ff" : "#2a2a2a"
                }}
              >
                <span className="text-xs font-medium" style={{ color: i < Math.floor(getTodaysWater() / 250) ? "#00d4ff" : "#888888" }}>250</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
      
      {/* Sleep Modal */}
      <Modal isOpen={showSleepModal} onClose={() => setShowSleepModal(false)} title="Log Sleep">
        <div className="space-y-4">
          <Slider label="Hours Slept" min={0} max={12} step={0.5} value={sleepHours} onChange={setSleepHours} unit="h" />
          <div>
            <label className="block text-sm font-medium text-mmrgb-textMuted mb-2">Sleep Quality</label>
            <div className="flex gap-2">
              {Array.from({ length: 5 }, (_, i) => (
                <button key={i} onClick={() => setSleepQuality(i + 1)} className={
                  "flex-1 min-h-[56px] rounded-xl border-2 font-bold transition-all " +
                  (sleepQuality > i ? "bg-mmrgb-primary/20 border-mmrgb-primary text-mmrgb-primary" : "border-mmrgb-border text-mmrgb-textMuted")
                }>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={handleSleepSubmit} fullWidth>Save</Button>
        </div>
      </Modal>
      
      {/* Soreness Modal */}
      <Modal isOpen={showSorenessModal} onClose={() => setShowSorenessModal(false)} title="Log Soreness">
        <p className="text-mmrgb-textMuted text-sm mb-4">Tap muscle groups that are sore</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {muscleGroups.map(group => (
            <button key={group} onClick={() => toggleSorenessGroup(group)} className={
              "min-h-[56px] p-3 rounded-xl border-2 text-sm font-medium transition-all " +
              (sorenessGroups.includes(group) ? "bg-red-500/10 border-red-500/30 text-red-400" : "border-mmrgb-border text-mmrgb-textMuted hover:border-mmrgb-textMuted")
            }>
              {group}
            </button>
          ))}
        </div>
        <Button onClick={handleSorenessSubmit} disabled={sorenessGroups.length === 0} fullWidth>Log Soreness</Button>
      </Modal>
    </div>
  )
}\;

fs.writeFileSync('C:\\\\Users\\\\Lenovo\\\\Downloads\\\\Documents\\\\hobbyvcode\\\\mmrgb\\\\src\\\\screens\\\\DashboardScreen.tsx', content, 'utf8');
console.log('Fixed DashboardScreen!');
