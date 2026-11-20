import fs from "fs";

const store = `import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { UserProfile, CalculatedTargets, FoodEntry, MealPreset, WorkoutRoutine, ActiveWorkout, BodyWeightEntry, SleepEntry, SorenessEntry, CreatineEntry, WaterEntry, DailyLog, Screen, ActivityLevel } from "../types"

interface AppState {
  profile: UserProfile | null
  targets: CalculatedTargets | null
  currentScreen: Screen
  isOnboarded: boolean
  foodEntries: FoodEntry[]
  mealPresets: MealPreset[]
  workoutRoutines: WorkoutRoutine[]
  activeWorkout: ActiveWorkout | null
  bodyWeightHistory: BodyWeightEntry[]
  sleepHistory: SleepEntry[]
  sorenessHistory: SorenessEntry[]
  creatineHistory: CreatineEntry[]
  waterHistory: WaterEntry[]
  dailyLogs: Record<string, DailyLog>
  setProfile: (profile: UserProfile) => void
  setTargets: (targets: CalculatedTargets) => void
  setScreen: (screen: Screen) => void
  completeOnboarding: () => void
  addFoodEntry: (entry: FoodEntry) => void
  deleteFoodEntry: (id: string) => void
  updateFoodEntry: (id: string, updates: Partial<FoodEntry>) => void
  addMealPreset: (preset: MealPreset) => void
  deleteMealPreset: (id: string) => void
  addWorkoutRoutine: (routine: WorkoutRoutine) => void
  deleteWorkoutRoutine: (id: string) => void
  updateWorkoutRoutine: (id: string, updates: Partial<WorkoutRoutine>) => void
  startWorkout: (routineId: string) => void
  updateExerciseSet: (exerciseId: string, setIndex: number, updates: Partial<ActiveWorkout["exercises"][0]["sets"][0]>) => void
  completeWorkout: () => void
  cancelWorkout: () => void
  addBodyWeight: (entry: BodyWeightEntry) => void
  addSleepEntry: (entry: SleepEntry) => void
  addSorenessEntry: (entry: SorenessEntry) => void
  addCreatineEntry: (entry: CreatineEntry) => void
  addWaterEntry: (entry: WaterEntry) => void
  getDailyLog: (date: string) => DailyLog
  getTodaysCalories: () => number
  getTodaysProtein: () => number
  getTodaysWater: () => number
  isCreatineTakenToday: () => boolean
}

const calculateTargets = (profile: UserProfile): CalculatedTargets => {
  const { height, weight, age, gender, activityLevel, goal } = profile
  const heightM = height / 100
  const bmi = weight / (heightM * heightM)
  let bmr: number
  if (gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161
  }
  const activityMultipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2, light: 1.375, moderate: 1.55, very: 1.725, extra: 1.9
  }
  const tdee = Math.round(bmr * activityMultipliers[activityLevel])
  let calorieAdjustment = 0
  let proteinMultiplier = 2.2
  switch (goal) {
    case "lean_bulk": calorieAdjustment = 200; proteinMultiplier = 2.2; break
    case "recomp": calorieAdjustment = 0; proteinMultiplier = 2.4; break
    case "mini_cut": calorieAdjustment = -300; proteinMultiplier = 2.6; break
  }
  const calories = tdee + calorieAdjustment
  const protein = Math.round(weight * proteinMultiplier)
  const fats = Math.round(calories * 0.25 / 9)
  const carbs = Math.round((calories - protein * 4 - fats * 9) / 4)
  return { bmi: Math.round(bmi * 10) / 10, tdee, calories, protein, carbs, fats }
}

const todayKey = () => new Date().toISOString().split("T")[0]

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: null,
      targets: null,
      currentScreen: "onboarding",
      isOnboarded: false,
      foodEntries: [],
      mealPresets: [],
      workoutRoutines: [],
      activeWorkout: null,
      bodyWeightHistory: [],
      sleepHistory: [],
      sorenessHistory: [],
      creatineHistory: [],
      waterHistory: [],
      dailyLogs: {},
      setProfile: (profile) => set({ profile, targets: calculateTargets(profile) }),
      setTargets: (targets) => set({ targets }),
      setScreen: (screen) => set({ currentScreen: screen }),
      completeOnboarding: () => set({ isOnboarded: true, currentScreen: "dashboard" }),
      addFoodEntry: (entry) => {
        const dateKey = todayKey()
        set((state) => {
          const newEntries = [...state.foodEntries, entry]
          const log = state.dailyLogs[dateKey] || { date: dateKey, foodEntries: [], soreness: [], water: [] }
          return { foodEntries: newEntries, dailyLogs: { ...state.dailyLogs, [dateKey]: { ...log, foodEntries: [...log.foodEntries, entry] } } }
        })
      },
      deleteFoodEntry: (id) => {
        const dateKey = todayKey()
        set((state) => {
          const newEntries = state.foodEntries.filter((e) => e.id !== id)
          const log = state.dailyLogs[dateKey]
          return { foodEntries: newEntries, dailyLogs: log ? { ...state.dailyLogs, [dateKey]: { ...log, foodEntries: log.foodEntries.filter((e) => e.id !== id) } } : state.dailyLogs }
        })
      },
      updateFoodEntry: (id, updates) => {
        const dateKey = todayKey()
        set((state) => {
          const newEntries = state.foodEntries.map((e) => (e.id === id ? { ...e, ...updates } : e))
          const log = state.dailyLogs[dateKey]
          return { foodEntries: newEntries, dailyLogs: log ? { ...state.dailyLogs, [dateKey]: { ...log, foodEntries: log.foodEntries.map((e) => (e.id === id ? { ...e, ...updates } : e)) } } : state.dailyLogs }
        })
      },
      addMealPreset: (preset) => set((state) => ({ mealPresets: [...state.mealPresets, preset] })),
      deleteMealPreset: (id) => set((state) => ({ mealPresets: state.mealPresets.filter((p) => p.id !== id) })),
      addWorkoutRoutine: (routine) => set((state) => ({ workoutRoutines: [...state.workoutRoutines, routine] })),
      deleteWorkoutRoutine: (id) => set((state) => ({ workoutRoutines: state.workoutRoutines.filter((r) => r.id !== id) })),
      updateWorkoutRoutine: (id, updates) => set((state) => ({ workoutRoutines: state.workoutRoutines.map((r) => (r.id === id ? { ...r, ...updates } : r)) })),
      startWorkout: (routineId) => {
        const routine = get().workoutRoutines.find((r) => r.id === routineId)
        if (!routine) return
        const exercises = routine.exercises.map((ex) => ({
          ...ex,
          id: ex.id,
          sets: Array.from({ length: ex.targetSets }, (_, i) => ({ reps: ex.targetReps, weight: ex.targetWeight, completed: false })),
          previousSession: get().dailyLogs[Object.keys(get().dailyLogs).find((k) => get().dailyLogs[k].workout?.exercises.some((e) => e.name === ex.name)) || ""]?.workout?.exercises.filter((e) => e.name === ex.name).map((e) => ({ sets: e.sets.length, reps: e.sets[0]?.reps || 0, weight: e.sets[0]?.weight || 0 })) || []
        }))
        set({ activeWorkout: { routineId, name: routine.name, exercises, startedAt: new Date() }, currentScreen: "workout" })
      },
      updateExerciseSet: (exerciseId, setIndex, updates) => set((state) => {
        if (!state.activeWorkout) return state
        return { activeWorkout: { ...state.activeWorkout, exercises: state.activeWorkout.exercises.map((ex) => ex.id === exerciseId ? { ...ex, sets: ex.sets.map((s, i) => (i === setIndex ? { ...s, ...updates } : s)) } : ex ) } }
      }),
      completeWorkout: () => {
        const { activeWorkout } = get()
        if (!activeWorkout) return
        const dateKey = todayKey()
        const completedWorkout = { ...activeWorkout, completedAt: new Date() }
        set((state) => {
          const log = state.dailyLogs[dateKey] || { date: dateKey, foodEntries: [], soreness: [], water: [] }
          return { activeWorkout: null, dailyLogs: { ...state.dailyLogs, [dateKey]: { ...log, workout: completedWorkout } }, currentScreen: "dashboard" }
        })
      },
      cancelWorkout: () => set({ activeWorkout: null, currentScreen: "dashboard" }),
      addBodyWeight: (entry) => set((state) => ({ bodyWeightHistory: [...state.bodyWeightHistory, entry].sort((a, b) => a.date.getTime() - b.date.getTime()) })),
      addSleepEntry: (entry) => {
        const dateKey = todayKey()
        set((state) => {
          const newHistory = [...state.sleepHistory, entry].sort((a, b) => a.date.getTime() - b.date.getTime())
          const log = state.dailyLogs[dateKey] || { date: dateKey, foodEntries: [], soreness: [], water: [] }
          return { sleepHistory: newHistory, dailyLogs: { ...state.dailyLogs, [dateKey]: { ...log, sleep: entry } } }
        })
      },
      addSorenessEntry: (entry) => {
        const dateKey = todayKey()
        set((state) => {
          const newHistory = [...state.sorenessHistory, entry].sort((a, b) => a.date.getTime() - b.date.getTime())
          const log = state.dailyLogs[dateKey] || { date: dateKey, foodEntries: [], soreness: [], water: [] }
          return { sorenessHistory: newHistory, dailyLogs: { ...state.dailyLogs, [dateKey]: { ...log, soreness: [...log.soreness, entry] } } }
        })
      },
      addCreatineEntry: (entry) => {
        const dateKey = todayKey()
        set((state) => {
          const newHistory = [...state.creatineHistory, entry].sort((a, b) => a.date.getTime() - b.date.getTime())
          const log = state.dailyLogs[dateKey] || { date: dateKey, foodEntries: [], soreness: [], water: [] }
          return { creatineHistory: newHistory, dailyLogs: { ...state.dailyLogs, [dateKey]: { ...log, creatine: entry } } }
        })
      },
      addWaterEntry: (entry) => {
        const dateKey = todayKey()
        set((state) => {
          const newHistory = [...state.waterHistory, entry].sort((a, b) => a.date.getTime() - b.date.getTime())
          const log = state.dailyLogs[dateKey] || { date: dateKey, foodEntries: [], soreness: [], water: [] }
          return { waterHistory: newHistory, dailyLogs: { ...state.dailyLogs, [dateKey]: { ...log, water: [...log.water, entry] } } }
        })
      },
      getDailyLog: (date) => get().dailyLogs[date] || { date, foodEntries: [], soreness: [], water: [] },
      getTodaysCalories: () => { const log = get().getDailyLog(todayKey()); return log.foodEntries.reduce((sum, e) => sum + e.calories, 0) },
      getTodaysProtein: () => { const log = get().getDailyLog(todayKey()); return log.foodEntries.reduce((sum, e) => sum + e.protein, 0) },
      getTodaysWater: () => { const log = get().getDailyLog(todayKey()); return log.water.reduce((sum, e) => sum + e.amount, 0) },
      isCreatineTakenToday: () => { const log = get().getDailyLog(todayKey()); return log.creatine?.taken || false }
    }),
    { name: "mmrgb-storage", partialize: (state) => ({ profile: state.profile, targets: state.targets, isOnboarded: state.isOnboarded, foodEntries: state.foodEntries, mealPresets: state.mealPresets, workoutRoutines: state.workoutRoutines, bodyWeightHistory: state.bodyWeightHistory, sleepHistory: state.sleepHistory, sorenessHistory: state.sorenessHistory, creatineHistory: state.creatineHistory, waterHistory: state.waterHistory, dailyLogs: state.dailyLogs }) }
  )
)
`;

fs.writeFileSync("C:/Users/Lenovo/Downloads/Documents/hobbyvcode/mmrgb/src/store/index.ts", store);
console.log("store/index.ts written");
