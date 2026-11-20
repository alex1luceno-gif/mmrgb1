import React, { useState, useEffect } from "react"
import { useStore } from "../store"
import { Card } from "../components/Card"
import { Button } from "../components/Button"
import { Modal } from "../components/Modal"
import { Input } from "../components/Input"
import { Tabs } from "../components/Tabs"
import { Select } from "../components/Select"
import { Plus, Trash2, Edit, Dumbbell, Timer, X, Check, PlusCircle, Calculator } from "lucide-react"
import { clsx } from "clsx"
import { formatDuration, getPlateMath, formatWeight, getMuscleGroupColor } from "../utils/calculations"

const MUSCLE_GROUPS = ["Chest", "Back", "Shoulders", "Arms", "Legs", "Core"]
const COMMON_EXERCISES = {
  Chest: ["Bench Press", "Incline Dumbbell Press", "Decline Bench Press", "Chest Flyes", "Push-ups", "Dips"],
  Back: ["Pull-ups", "Lat Pulldowns", "Barbell Rows", "Dumbbell Rows", "Cable Rows", "Deadlifts"],
  Shoulders: ["Overhead Press", "Lateral Raises", "Rear Delt Flyes", "Front Raises", "Arnold Press", "Face Pulls"],
  Arms: ["Bicep Curls", "Hammer Curls", "Tricep Pushdowns", "Overhead Tricep Ext", "Preacher Curls", "Skull Crushers"],
  Legs: ["Squats", "Leg Press", "Romanian Deadlifts", "Leg Extensions", "Leg Curls", "Calf Raises", "Lunges"],
  Core: ["Plank", "Hanging Leg Raises", "Cable Crunches", "Russian Twists", "Ab Wheel", "Dead Bugs"]
}

export const WorkoutScreen: React.FC = () => {
  const { workoutRoutines, activeWorkout, addWorkoutRoutine, deleteWorkoutRoutine, updateWorkoutRoutine, startWorkout, updateExerciseSet, completeWorkout, cancelWorkout, dailyLogs, isRoutineCompletedToday } = useStore()
  const [activeTab, setActiveTab] = useState<"routines" | "create">("routines")
  const [showRoutineModal, setShowRoutineModal] = useState(false)
  const [editingRoutine, setEditingRoutine] = useState<typeof workoutRoutines[0] | null>(null)
  const [routineForm, setRoutineForm] = useState({
    name: "",
    exercises: [] as { name: string; muscleGroup: string; targetSets: number; targetReps: number; targetWeight: number; restTime: number }[]
  })
  const [showPlateMath, setShowPlateMath] = useState(false)
  const [plateMathWeight, setPlateMathWeight] = useState(100)
  const [restTimers, setRestTimers] = useState<Record<string, { remaining: number; interval: ReturnType<typeof setTimeout> | null }>>({})
  const [showExerciseModal, setShowExerciseModal] = useState(false)
  const [editingExerciseIdx, setEditingExerciseIdx] = useState<number | null>(null)
  const [exerciseForm, setExerciseForm] = useState({
    name: "",
    muscleGroup: "Chest",
    targetSets: 3,
    targetReps: 10,
    targetWeight: 60,
    restTime: 90
  })

  useEffect(() => {
    if (activeWorkout) {
      activeWorkout.exercises.forEach(ex => {
        ex.sets.forEach((set, setIdx) => {
          const key = ex.id + "-" + setIdx
          if (set.completed && !restTimers[key]) {
            const restTime = ex.restTime || 90
            const interval = setInterval(() => {
              setRestTimers(prev => {
                const timer = prev[key]
                if (!timer || timer.remaining <= 1) {
                  clearInterval(interval)
                  return { ...prev, [key]: { ...timer, remaining: 0, interval: null } }
                }
                return { ...prev, [key]: { ...timer, remaining: timer.remaining - 1 } }
              })
            }, 1000)
            setRestTimers(prev => ({ ...prev, [key]: { remaining: restTime, interval } }))
          }
        })
      })
    }
    return () => {
      Object.values(restTimers).forEach(t => t.interval && clearInterval(t.interval))
    }
  }, [activeWorkout, restTimers])

  const openRoutineModal = (routine?: typeof workoutRoutines[0]) => {
    if (routine) {
      setEditingRoutine(routine)
      setRoutineForm({
        name: routine.name,
        exercises: routine.exercises.map(e => ({ name: e.name, muscleGroup: e.muscleGroup, targetSets: e.targetSets, targetReps: e.targetReps, targetWeight: e.targetWeight, restTime: e.restTime }))
      })
    } else {
      setEditingRoutine(null)
      setRoutineForm({ name: "", exercises: [] })
    }
    setShowRoutineModal(true)
  }

  const handleRoutineSubmit = () => {
    if (editingRoutine) {
      updateWorkoutRoutine(editingRoutine.id, { name: routineForm.name, exercises: routineForm.exercises.map((e, i) => ({ ...e, id: editingRoutine.exercises[i]?.id || Date.now().toString() + i })) })
    } else {
      addWorkoutRoutine({ id: Date.now().toString(), name: routineForm.name, exercises: routineForm.exercises.map(e => ({ ...e, id: Date.now().toString() + Math.random() })), createdAt: new Date() })
    }
    setShowRoutineModal(false)
  }

  const addExerciseToRoutine = () => {
    setExerciseForm({ name: "", muscleGroup: "Chest", targetSets: 3, targetReps: 10, targetWeight: 60, restTime: 90 })
    setEditingExerciseIdx(null)
    setShowExerciseModal(true)
  }

  const editExerciseInRoutine = (idx: number) => {
    const ex = routineForm.exercises[idx]
    setExerciseForm({ name: ex.name, muscleGroup: ex.muscleGroup, targetSets: ex.targetSets, targetReps: ex.targetReps, targetWeight: ex.targetWeight, restTime: ex.restTime })
    setEditingExerciseIdx(idx)
    setShowExerciseModal(true)
  }

  const handleExerciseSubmit = () => {
    const newEx = { ...exerciseForm }
    if (editingExerciseIdx !== null) {
      setRoutineForm(prev => ({ ...prev, exercises: prev.exercises.map((e, i) => i === editingExerciseIdx ? newEx : e) }))
    } else {
      setRoutineForm(prev => ({ ...prev, exercises: [...prev.exercises, newEx] }))
    }
    setShowExerciseModal(false)
  }

  const removeExerciseFromRoutine = (idx: number) => {
    setRoutineForm(prev => ({ ...prev, exercises: prev.exercises.filter((_, i) => i !== idx) }))
  }

  const getPreviousSession = (exerciseName: string) => {
    const logs = Object.values(dailyLogs).filter(log => log.workouts && log.workouts.length > 0)
    for (const log of logs.reverse()) {
      const workout = log.workouts.find(w => w.exercises.some(e => e.name === exerciseName)); const ex = workout?.exercises.find(e => e.name === exerciseName)
      if (ex) return ex.sets
    }
    return null
  }

  const handleSetComplete = (exerciseId: string, setIndex: number) => {
    updateExerciseSet(exerciseId, setIndex, { completed: true })
    const ex = activeWorkout?.exercises.find(e => e.id === exerciseId)
    if (ex) {
      const key = exerciseId + "-" + setIndex
      const restTime = ex.restTime || 90
      const interval = setInterval(() => {
        setRestTimers(prev => {
          const timer = prev[key]
          if (!timer || timer.remaining <= 1) {
            clearInterval(interval)
            return { ...prev, [key]: { ...timer, remaining: 0, interval: null } }
          }
          return { ...prev, [key]: { ...timer, remaining: timer.remaining - 1 } }
        })
      }, 1000)
      setRestTimers(prev => ({ ...prev, [key]: { remaining: restTime, interval } }))
    }
  }

  const handleWeightChange = (exerciseId: string, setIndex: number, weight: number) => {
    updateExerciseSet(exerciseId, setIndex, { weight })
  }

  const handleRepsChange = (exerciseId: string, setIndex: number, reps: number) => {
    updateExerciseSet(exerciseId, setIndex, { reps })
  }

  const handleRPEChange = (exerciseId: string, setIndex: number, rpe: number) => {
    updateExerciseSet(exerciseId, setIndex, { rpe })
  }

  if (activeWorkout) {
    return (
      <>
        <header className="sticky top-0 z-40 bg-mmrgb-bg/80 backdrop-blur-xl border-b border-mmrgb-border">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={cancelWorkout} className="p-2 rounded-xl text-mmrgb-textMuted hover:text-mmrgb-text hover:bg-mmrgb-surfaceElevated transition-colors">
                <X className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-mmrgb-text">{activeWorkout.name}</h1>
                <p className="text-sm text-mmrgb-textMuted">{activeWorkout.exercises.length} exercises</p>
              </div>
            </div>
            {(() => {
              const allCompleted = activeWorkout.exercises.every(ex => ex.sets.every(s => s.completed));
              return (
                <Button onClick={completeWorkout} variant="primary" size="sm" disabled={!allCompleted} className={!allCompleted ? "opacity-50" : ""}>
                  <Check className="w-4 h-4" /> Finish
                </Button>
              );
            })()}
          </div>
        </header>
        <div className="p-4 pb-28 space-y-4">
          {activeWorkout.exercises.map((exercise) => {
            const previousSets = getPreviousSession(exercise.name)
            const color = getMuscleGroupColor(exercise.muscleGroup)
            return (
              <Card key={exercise.id} padding="md">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color + "20" }}>
                      <Dumbbell className="w-5 h-5" style={{ color }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-mmrgb-text">{exercise.name}</h3>
                      <p className="text-sm text-mmrgb-textMuted capitalize">{exercise.muscleGroup}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { setPlateMathWeight(exercise.targetWeight); setShowPlateMath(true); }}>
                    <Calculator className="w-4 h-4" /> Plate Math
                  </Button>
                </div>
                {previousSets && previousSets.length > 0 && (
                  <div className="mb-4 p-3 bg-mmrgb-surfaceElevated rounded-xl border border-mmrgb-border">
                    <p className="text-xs text-mmrgb-textMuted mb-1">Last Session</p>
                    <div className="flex flex-wrap gap-2">
                      {previousSets.map((s, i) => (
                        <span key={i} className="px-2 py-1 bg-mmrgb-border rounded text-xs text-mmrgb-textMuted">
                          {s.reps}×{formatWeight(s.weight)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  {exercise.sets.map((set, setIdx) => (
                    <div key={setIdx} className={clsx(
                      "flex items-center gap-3 p-3 rounded-xl transition-colors",
                      set.completed ? "bg-mmrgb-primary/10 border border-mmrgb-primary/30" : "bg-mmrgb-surfaceElevated border border-mmrgb-border"
                    )}>
                      <div className="w-8 text-center text-sm font-medium text-mmrgb-textMuted">{setIdx + 1}</div>
                      <div className="flex-1 flex items-center gap-2">
                        <Input type="number" value={set.reps} onChange={e => handleRepsChange(exercise.id, setIdx, Number(e.target.value))} className="w-20 py-2 text-center" min={1} max={100} />
                        <span className="text-mmrgb-textMuted">×</span>
                        <Input type="number" value={set.weight} onChange={e => handleWeightChange(exercise.id, setIdx, Number(e.target.value))} className="w-24 py-2 text-center" min={0} max={500} step={0.5} />
                        <span className="text-sm text-mmrgb-textMuted">kg</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input type="number" value={set.rpe || 0} onChange={e => handleRPEChange(exercise.id, setIdx, Number(e.target.value))} className="w-20 py-2 text-center" min={1} max={10} step={0.5} placeholder="RPE" />
                        {restTimers[exercise.id + "-" + setIdx] && restTimers[exercise.id + "-" + setIdx].remaining > 0 && (
                          <div className="flex items-center gap-1 text-sm text-mmrgb-primary">
                            <Timer className="w-4 h-4" />
                            {formatDuration(restTimers[exercise.id + "-" + setIdx].remaining)}
                          </div>
                        )}
                        <button onClick={() => handleSetComplete(exercise.id, setIdx)} className={clsx(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                          set.completed ? "bg-mmrgb-primary text-mmrgb-bg" : "bg-mmrgb-border text-mmrgb-textMuted hover:bg-mmrgb-textMuted/20"
                        )}>
                          <Check className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )
          })}
        </div>
        <Modal isOpen={showPlateMath} onClose={() => setShowPlateMath(false)} title="Plate Calculator">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Input label="Target Weight (kg)" type="number" value={plateMathWeight} onChange={e => setPlateMathWeight(Number(e.target.value))} min={0} max={500} step={2.5} />
            </div>
            <div className="p-4 bg-mmrgb-surfaceElevated rounded-xl">
              {(() => {
                const { plates, totalWeight } = getPlateMath(plateMathWeight)
                return (
                  <>
                    <p className="text-center text-2xl font-bold text-mmrgb-text mb-4">{formatWeight(totalWeight)}</p>
                    {Object.entries(plates).length === 0 ? (
                      <p className="text-center text-mmrgb-textMuted">Just the bar ({formatWeight(20)})</p>
                    ) : (
                      <div className="flex flex-wrap justify-center gap-4">
                        {Object.entries(plates).sort(([a], [b]) => Number(b) - Number(a)).map(([plate, count]) => (
                          <div key={plate} className="flex items-center gap-2">
                            <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center" style={{ borderColor: "rgba(0, 255, 136, " + (0.3 + Number(plate) / 100) + ")" }}>
                              <span className="text-sm font-bold text-mmrgb-text">{plate}kg</span>
                            </div>
                            <span className="text-lg font-bold text-mmrgb-text align-middle">×{count} per side</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
          </div>
        </Modal>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-mmrgb-bg">
      <header className="sticky top-0 z-40 bg-mmrgb-bg/80 backdrop-blur-xl border-b border-mmrgb-border">
        <div className="p-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-mmrgb-text">Workout</h1>
          <Button onClick={() => openRoutineModal()} size="sm">
            <Plus className="w-4 h-4" /> New Routine
          </Button>
        </div>
        <Tabs tabs={[
          { id: "routines", label: "Routines", icon: <Dumbbell className="w-4 h-4" />, count: workoutRoutines.length },
          { id: "create", label: "Create", icon: <PlusCircle className="w-4 h-4" /> }
        ]} activeTab={activeTab} onChange={(id: string) => setActiveTab(id as "routines" | "create")} variant="pills" className="px-4 pb-4" />
      </header>
      <div className="p-4 pb-28 space-y-4">
        {activeTab === "routines" && (
          workoutRoutines.length === 0 ? (
            <Card padding="lg" className="text-center">
              <Dumbbell className="w-12 h-12 text-mmrgb-textDim mx-auto mb-4" />
              <p className="text-mmrgb-textMuted mb-4">No routines yet</p>
              <Button onClick={() => openRoutineModal()}>
                <Plus className="w-4 h-4" /> Create First Routine
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {workoutRoutines.map(routine => (
                <Card key={routine.id} padding="md" onClick={() => startWorkout(routine.id)} hover>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-mmrgb-text">{routine.name}</h3>
                      <p className="text-sm text-mmrgb-textMuted">{routine.exercises.length} exercises</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isRoutineCompletedToday(routine.id) && (
                        <span className="px-2 py-1 bg-mmrgb-primary/20 text-mmrgb-primary text-xs font-medium rounded-full">Done</span>
                      )}
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openRoutineModal(routine); }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <button onClick={(e) => { e.stopPropagation(); deleteWorkoutRoutine(routine.id); }} className="p-2 text-mmrgb-textMuted hover:text-mmrgb-danger hover:bg-mmrgb-surface rounded-xl transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {routine.exercises.slice(0, 4).map((ex, i) => (
                      <span key={i} className="px-3 py-1 bg-mmrgb-surfaceElevated rounded-full text-xs text-mmrgb-textMuted">{ex.name}</span>
                    ))}
                    {routine.exercises.length > 4 && (
                      <span className="px-3 py-1 bg-mmrgb-surfaceElevated rounded-full text-xs text-mmrgb-textMuted">+{routine.exercises.length - 4} more</span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )
        )}
        {activeTab === "create" && (
          <>
            <Card padding="lg">
              <h2 className="text-lg font-bold text-mmrgb-text mb-4">Build Your Routine</h2>
              {routineForm.exercises.length > 0 && (
                <div className="mb-4 p-3 bg-mmrgb-surfaceElevated rounded-xl border border-mmrgb-border">
                  <p className="text-xs text-mmrgb-textMuted mb-1">Routine Summary</p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="px-2 py-1 bg-mmrgb-primary/20 text-mmrgb-primary rounded-full">{routineForm.exercises.length} exercises</span>
                    <span className="px-2 py-1 bg-mmrgb-secondary/20 text-mmrgb-secondary rounded-full">{routineForm.exercises.reduce((sum, e) => sum + e.targetSets, 0)} total sets</span>
                  </div>
                </div>
              )}
              <div className="space-y-3 mb-4">
                {routineForm.exercises.map((ex, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-mmrgb-surfaceElevated rounded-xl">
                    <div className="w-8 text-center text-sm font-medium text-mmrgb-textMuted">{idx + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-mmrgb-text truncate">{ex.name}</p>
                      <p className="text-xs text-mmrgb-textMuted">{ex.targetSets}×{ex.targetReps} @ {formatWeight(ex.targetWeight)} â€¢ {ex.restTime}s rest</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => editExerciseInRoutine(idx)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <button onClick={() => removeExerciseFromRoutine(idx)} className="p-2 text-mmrgb-textMuted hover:text-mmrgb-danger hover:bg-mmrgb-surface rounded-xl transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              {routineForm.exercises.length === 0 ? (
                <p className="text-center text-mmrgb-textMuted py-4">No exercises added yet</p>
              ) : null}
              <Button onClick={addExerciseToRoutine} fullWidth variant="secondary">
                <Plus className="w-4 h-4" /> Add Exercise
              </Button>
              {routineForm.name && routineForm.exercises.length > 0 && (
                <Button onClick={handleRoutineSubmit} fullWidth className="mt-3">Save Routine</Button>
              )}
            </Card>
          </>
        )}
      </div>
      <Modal isOpen={showRoutineModal} onClose={() => setShowRoutineModal(false)} title={editingRoutine ? "Edit Routine" : "Create Routine"} size="lg">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <Input label="Routine Name" value={routineForm.name} onChange={e => setRoutineForm({ ...routineForm, name: e.target.value })} placeholder="Push Day" />
          {routineForm.exercises.length > 0 && (
            <div className="mb-4 p-3 bg-mmrgb-surfaceElevated rounded-xl border border-mmrgb-border">
              <p className="text-xs text-mmrgb-textMuted mb-1">Routine Summary</p>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="px-2 py-1 bg-mmrgb-primary/20 text-mmrgb-primary rounded-full">{routineForm.exercises.length} exercises</span>
                <span className="px-2 py-1 bg-mmrgb-secondary/20 text-mmrgb-secondary rounded-full">{routineForm.exercises.reduce((sum, e) => sum + e.targetSets, 0)} total sets</span>
              </div>
            </div>
          )}
          <Button onClick={addExerciseToRoutine} fullWidth variant="secondary" className="justify-start">
            <Plus className="w-4 h-4" /> Add Exercise
          </Button>
          <Button onClick={handleRoutineSubmit} fullWidth disabled={!routineForm.name || routineForm.exercises.length === 0}>
            {editingRoutine ? "Save Changes" : "Create Routine"}
          </Button>
        </div>
      </Modal>
      <Modal isOpen={showExerciseModal} onClose={() => setShowExerciseModal(false)} title={editingExerciseIdx !== null ? "Edit Exercise" : "Add Exercise"} size="lg">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <Input label="Exercise Name" value={exerciseForm.name} onChange={e => setExerciseForm({ ...exerciseForm, name: e.target.value })} placeholder="Bench Press" list="exercise-suggestions" />
          <datalist id="exercise-suggestions">
            {(MUSCLE_GROUPS as Array<keyof typeof COMMON_EXERCISES>).flatMap(g => COMMON_EXERCISES[g] || []).map(ex => <option key={ex} value={ex} />)}
          </datalist>
          <Select label="Muscle Group" value={exerciseForm.muscleGroup} onChange={(v: string) => setExerciseForm({ ...exerciseForm, muscleGroup: v })} options={MUSCLE_GROUPS.map(g => ({ value: g, label: g }))} />
          <div className="grid grid-cols-3 gap-3">
            <Input label="Sets" type="number" value={exerciseForm.targetSets} onChange={e => setExerciseForm({ ...exerciseForm, targetSets: Number(e.target.value) })} min={1} max={10} />
            <Input label="Reps" type="number" value={exerciseForm.targetReps} onChange={e => setExerciseForm({ ...exerciseForm, targetReps: Number(e.target.value) })} min={1} max={50} />
            <Input label="Rest (s)" type="number" value={exerciseForm.restTime} onChange={e => setExerciseForm({ ...exerciseForm, restTime: Number(e.target.value) })} min={30} max={300} step={15} />
          </div>
          <Input label="Target Weight (kg)" type="number" value={exerciseForm.targetWeight} onChange={e => setExerciseForm({ ...exerciseForm, targetWeight: Number(e.target.value) })} min={0} max={500} step={0.5} />
          <Button onClick={handleExerciseSubmit} fullWidth>{editingExerciseIdx !== null ? "Save Changes" : "Add Exercise"}</Button>
        </div>
      </Modal>
    </div>
  )
}
