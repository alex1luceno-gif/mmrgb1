import React, { useState } from "react"
import { useStore } from "../store"
import { Card } from "../components/Card"
import { Button } from "../components/Button"
import { Input } from "../components/Input"
import { Select } from "../components/Select"
import { Modal } from "../components/Modal"
import { Trash2, User, Download, Upload, AlertTriangle, Info, Scale, TrendingUp, Minus, Plus } from "lucide-react"
import type { Gender, ActivityLevel, Goal } from "../types"

const formatDate = (date: Date) => date.toISOString().split("T")[0]

// Safe date parsing - handles Date objects, ISO strings, timestamps, and invalid values
const safeToDate = (value: Date | string | number | null | undefined): Date => {
  if (value instanceof Date) return isNaN(value.getTime()) ? new Date() : value;
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
  }
  return new Date();
};

export const SettingsScreen: React.FC = () => {
  const { profile, targets, setProfile, setTargets, foodEntries, workoutRoutines, bodyWeightHistory, sleepHistory, sorenessHistory, creatineHistory, waterHistory, dailyLogs, mealPresets, addBodyWeight } = useStore()
  const [showResetModal, setShowResetModal] = useState(false)
  const [weightInput, setWeightInput] = useState("")

  const profileForm = {
    height: profile?.height || 175,
    weight: profile?.weight || 75,
    age: profile?.age || 25,
    gender: profile?.gender || "male" as Gender,
    activityLevel: profile?.activityLevel || "moderate" as ActivityLevel,
    goal: profile?.goal || "lean_bulk" as Goal
  }

  const handleAddWeight = () => {
    const weight = Number(weightInput)
    if (weight && weight > 0) {
      addBodyWeight({ id: crypto.randomUUID(), weight, date: new Date() })
      setWeightInput("")
    }
  }

  const handleProfileSave = () => { setProfile(profileForm) }

  const handleExport = () => {
    const data = { profile, targets, foodEntries, workoutRoutines, bodyWeightHistory, sleepHistory, sorenessHistory, creatineHistory, waterHistory, dailyLogs, mealPresets, exportedAt: new Date().toISOString() }
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "mmrgb-backup-" + formatDate(new Date()) + ".json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        if (data.profile) setProfile(data.profile)
        if (data.targets) setTargets(data.targets)
        if (data.foodEntries) localStorage.setItem("mmrgb-foodEntries", JSON.stringify(data.foodEntries))
        if (data.workoutRoutines) localStorage.setItem("mmrgb-workoutRoutines", JSON.stringify(data.workoutRoutines))
        if (data.bodyWeightHistory) localStorage.setItem("mmrgb-bodyWeightHistory", JSON.stringify(data.bodyWeightHistory))
        if (data.sleepHistory) localStorage.setItem("mmrgb-sleepHistory", JSON.stringify(data.sleepHistory))
        if (data.sorenessHistory) localStorage.setItem("mmrgb-sorenessHistory", JSON.stringify(data.sorenessHistory))
        if (data.creatineHistory) localStorage.setItem("mmrgb-creatineHistory", JSON.stringify(data.creatineHistory))
        if (data.waterHistory) localStorage.setItem("mmrgb-waterHistory", JSON.stringify(data.waterHistory))
        if (data.dailyLogs) localStorage.setItem("mmrgb-dailyLogs", JSON.stringify(data.dailyLogs))
        if (data.mealPresets) localStorage.setItem("mmrgb-mealPresets", JSON.stringify(data.mealPresets))
        window.location.reload()
      } catch { alert("Invalid backup file") }
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  const handleReset = () => {
    localStorage.removeItem("mmrgb-storage")
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-mmrgb-bg">
      <header className="sticky top-0 z-40 bg-mmrgb-bg/80 backdrop-blur-xl border-b border-mmrgb-border">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-mmrgb-text">Settings</h1>
        </div>
      </header>
      <div className="p-4 pb-32 space-y-4">
        {profile && (
          <Card padding="lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-mmrgb-primary/20 flex items-center justify-center">
                <User className="w-6 h-6 text-mmrgb-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-mmrgb-text">Profile</h2>
                <p className="text-sm text-mmrgb-textMuted">Update your body stats and goals</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Input label="Height (cm)" type="number" value={profileForm.height} onChange={e => { profileForm.height = Number(e.target.value); }} min={100} max={250} />
              <Input label="Weight (kg)" type="number" value={profileForm.weight} onChange={e => { profileForm.weight = Number(e.target.value); }} min={30} max={200} />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Input label="Age" type="number" value={profileForm.age} onChange={e => { profileForm.age = Number(e.target.value); }} min={13} max={100} />
              <Select label="Gender" value={profileForm.gender} onChange={(v: string) => { profileForm.gender = v as Gender; }} options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }]} />
            </div>
            <div className="mb-4">
              <Select label="Activity Level" value={profileForm.activityLevel} onChange={(v: string) => { profileForm.activityLevel = v as ActivityLevel; }} options={[
                { value: "sedentary", label: "Sedentary" },
                { value: "light", label: "Light" },
                { value: "moderate", label: "Moderate" },
                { value: "very", label: "Very Active" },
                { value: "extra", label: "Extra Active" }
              ]} />
            </div>
            <div className="mb-4">
              <Select label="Goal" value={profileForm.goal} onChange={(v: string) => { profileForm.goal = v as Goal; }} options={[
                { value: "lean_bulk", label: "Lean Bulk" },
                { value: "recomp", label: "Recomp" },
                { value: "mini_cut", label: "Mini Cut" }
              ]} />
            </div>
            <Button onClick={handleProfileSave} fullWidth>Save Profile</Button>
          </Card>
        )}
        {targets && (
          <Card padding="lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-mmrgb-secondary/20 flex items-center justify-center">
                <Info className="w-6 h-6 text-mmrgb-secondary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-mmrgb-text">Calculated Targets</h2>
                <p className="text-sm text-mmrgb-textMuted">Auto-calculated from your profile</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-mmrgb-surfaceElevated rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-mmrgb-primary">{targets.calories}</p>
                <p className="text-xs text-mmrgb-textMuted">Daily Calories</p>
              </div>
              <div className="bg-mmrgb-surfaceElevated rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-mmrgb-secondary">{targets.protein}g</p>
                <p className="text-xs text-mmrgb-textMuted">Protein Target</p>
              </div>
              <div className="bg-mmrgb-surfaceElevated rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-mmrgb-warning">{targets.carbs}g</p>
                <p className="text-xs text-mmrgb-textMuted">Carbs Target</p>
              </div>
              <div className="bg-mmrgb-surfaceElevated rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-mmrgb-danger">{targets.fats}g</p>
                <p className="text-xs text-mmrgb-textMuted">Fats Target</p>
              </div>
            </div>
          </Card>
        )}
        {/* Body Weight Tracking */}
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-mmrgb-primary/20 flex items-center justify-center">
              <Scale className="w-6 h-6 text-mmrgb-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-mmrgb-text">Body Weight</h2>
              <p className="text-sm text-mmrgb-textMuted">Track your weight over time</p>
            </div>
          </div>
          <div className="flex gap-3 mb-4">
            <Input 
              label="Weight (kg)" 
              type="number" 
              value={weightInput} 
              onChange={e => setWeightInput(e.target.value)} 
              placeholder={profile?.weight?.toString() || "75"}
              min={30} 
              max={200} 
              step={0.1}
              className="flex-1"
            />
            <Button onClick={handleAddWeight} className="min-w-[100px]">
              <Plus className="w-4 h-4" /> Log
            </Button>
          </div>
          {bodyWeightHistory.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              <p className="text-xs text-mmrgb-textMuted mb-2">Recent Entries</p>
              {bodyWeightHistory
                .slice()
                .reverse()
                .slice(0, 10)
                .map((entry, idx) => {
                  const prevEntry = bodyWeightHistory.slice().reverse()[idx + 1]
                  const weightDiff = prevEntry ? entry.weight - prevEntry.weight : 0
                  return (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-mmrgb-surfaceElevated rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-mmrgb-textMuted">
                          {safeToDate(entry.date).toLocaleDateString()}
                        </span>
                        <span className="text-lg font-bold text-mmrgb-text">
                          {entry.weight}kg
                        </span>
                      </div>
                      {prevEntry && (
                        <span className="text-sm flex items-center gap-1" style={{ color: weightDiff > 0 ? "#ff4d6d" : weightDiff < 0 ? "#00ff88" : "#888" }}>
                          {weightDiff > 0 ? <TrendingUp className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                          {Math.abs(weightDiff).toFixed(1)}kg
                        </span>
                      )}
                    </div>
                  )
                })}
            </div>
          )}
        </Card>
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-mmrgb-warning/20 flex items-center justify-center">
              <Download className="w-6 h-6 text-mmrgb-warning" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-mmrgb-text">Data Management</h2>
              <p className="text-sm text-mmrgb-textMuted">Export or import your data</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleExport} fullWidth variant="secondary">
              <Download className="w-4 h-4" /> Export Data
            </Button>
            <label className="flex-1">
              <Button variant="secondary" fullWidth>
                <Upload className="w-4 h-4" /> Import Data
              </Button>
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>
        </Card>
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-mmrgb-danger/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-mmrgb-danger" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-mmrgb-text">Danger Zone</h2>
              <p className="text-sm text-mmrgb-textMuted">Irreversible actions</p>
            </div>
          </div>
          <Button onClick={() => setShowResetModal(true)} fullWidth variant="danger">
            <Trash2 className="w-4 h-4" /> Reset All Data
          </Button>
        </Card>
        <Card padding="lg">
          <h2 className="text-lg font-bold text-mmrgb-text mb-4">About</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-mmrgb-textMuted">Version</span>
              <span className="text-mmrgb-text">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mmrgb-textMuted">Name</span>
              <span className="text-mmrgb-text">MMRGB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mmrgb-textMuted">Meaning</span>
              <span className="text-mmrgb-text">My Muscles Are Getting Bigger</span>
            </div>
          </div>
        </Card>
      </div>
      <Modal isOpen={showResetModal} onClose={() => setShowResetModal(false)} title="Reset All Data">
        <div className="space-y-4">
          <div className="p-4 bg-mmrgb-danger/10 border border-mmrgb-danger/30 rounded-xl">
            <p className="text-mmrgb-text">This will permanently delete all your data:</p>
            <ul className="list-disc list-inside mt-2 text-sm text-mmrgb-textMuted space-y-1">
              <li>Profile & calculated targets</li>
              <li>All food entries & meal presets</li>
              <li>Workout routines & history</li>
              <li>Body weight, sleep, soreness logs</li>
              <li>Water & creatine tracking</li>
            </ul>
          </div>
          <p className="text-sm text-mmrgb-danger font-medium">This action cannot be undone.</p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowResetModal(false)} fullWidth>Cancel</Button>
            <Button variant="danger" onClick={handleReset} fullWidth>Reset Everything</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
