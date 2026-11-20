import React, { useState, useMemo } from "react"
import { useStore } from "../store"
import { Card } from "../components/Card"
import { Tabs } from "../components/Tabs"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { Line, Bar } from "react-chartjs-2"
import { Dumbbell, TrendingUp, Target, Activity, RotateCcw } from "lucide-react"
import { clsx } from "clsx"
import { formatDate, formatDateDisplay, calculate1RM, getMuscleGroupColor } from "../utils/calculations"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const CHART_COLORS = ["#00ff88", "#00d4ff", "#ffaa00", "#ff3366", "#aa66ff", "#00ffcc"]
const CHART_GRADIENTS = CHART_COLORS.map(c => c + "40")

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#121212",
      titleColor: "#ffffff",
      bodyColor: "#ffffff",
      borderColor: "#2a2a2a",
      borderWidth: 1,
      padding: 12,
      displayColors: true,
      callbacks: {
        label: (context: any) => {
          let label = context.dataset.label || ""
          if (label) label += ": "
          if (context.parsed.y !== null) {
            label += context.parsed.y.toFixed(label.includes("Weight") ? 1 : 0)
            label += label.includes("Weight") ? "kg" : label.includes("Volume") ? "kg" : ""
          }
          return label
        }
      }
    }
  },
  scales: {
    x: { grid: { color: "#2a2a2a" }, ticks: { color: "#888888", font: { size: 11 } } },
    y: { grid: { color: "#2a2a2a" }, ticks: { color: "#888888", font: { size: 11 } } }
  },
  interaction: { intersect: false, mode: "index" as const }
}

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

// Type definitions for chart data
interface WeightDataPoint {
  date: string
  weight: number
  rawDate: Date
}

interface StrengthDataPoint {
  date: string
  exercise: string
  weight: number
  reps: number
  oneRM: number
  muscleGroup: string
  rawDate: Date
}

interface VolumeDataPoint {
  date: string
  muscleGroup: string
  volume: number
  rawDate: Date
}

interface RecoveryDataPoint {
  group: string
  daysSince: number
  recovered: boolean
  color: string
}

export const ProgressScreen: React.FC = () => {
  const { bodyWeightHistory, dailyLogs, targets, profile } = useStore()
  const [timeRange, setTimeRange] = useState<"week" | "month" | "3month" | "year" | "all">("month")

  const weightData = useMemo((): WeightDataPoint[] => bodyWeightHistory.map((entry) => ({
    date: formatDateDisplay(safeToDate(entry.date)),
    weight: toNum(entry.weight),
    rawDate: safeToDate(entry.date)
  })).slice(-30), [bodyWeightHistory])

  const strengthData = useMemo((): StrengthDataPoint[] => {
    const result: StrengthDataPoint[] = []
    Object.values(dailyLogs).filter(log => log.workouts && log.workouts.length > 0).forEach(log => {
      log.workouts.forEach(workout => {
        const startedAt = safeToDate(workout.startedAt)
        workout.exercises.forEach(ex => {
          ex.sets.filter(s => s.completed).forEach(s => {
            result.push({
              date: formatDateDisplay(startedAt),
              exercise: ex.name,
              weight: toNum(s.weight),
              reps: toNum(s.reps),
              oneRM: calculate1RM(toNum(s.weight), toNum(s.reps)),
              muscleGroup: ex.muscleGroup,
              rawDate: startedAt
            })
          })
        })
      })
    })
    return result.sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime())
  }, [dailyLogs])

  const volumeData = useMemo((): VolumeDataPoint[] => {
    const map = new Map<string, VolumeDataPoint>()
    Object.values(dailyLogs).filter(log => log.workouts && log.workouts.length > 0).forEach(log => {
      log.workouts.forEach(workout => {
        const startedAt = safeToDate(workout.startedAt)
        const dateStr = formatDate(startedAt)
        workout.exercises.forEach(ex => {
          const volume = ex.sets.filter(s => s.completed).reduce((sum: number, s) => sum + toNum(s.weight) * toNum(s.reps), 0)
          const key = dateStr + "|" + ex.muscleGroup
          const existing = map.get(key)
          if (existing) {
            existing.volume += volume
          } else {
            map.set(key, { date: dateStr, muscleGroup: ex.muscleGroup, volume, rawDate: startedAt })
          }
        })
      })
    })
    return Array.from(map.values()).sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime())
  }, [dailyLogs])

  const muscleGroups = useMemo(() => [...new Set(strengthData.map(d => d.muscleGroup))], [strengthData])

  const recoveryData = useMemo((): RecoveryDataPoint[] => muscleGroups.map((group) => {
    const lastWorkout = strengthData.filter(d => d.muscleGroup === group).pop()
    if (!lastWorkout) return { group, daysSince: 99, recovered: true, color: getMuscleGroupColor(group) }
    const daysSince = Math.floor((Date.now() - lastWorkout.rawDate.getTime()) / (1000 * 60 * 60 * 24))
    return { group, daysSince, recovered: daysSince >= 2, color: getMuscleGroupColor(group) }
  }), [muscleGroups, strengthData])

  const weightChartData = useMemo(() => ({
    labels: weightData.map(d => d.date),
    datasets: [{
      label: "Weight (kg)",
      data: weightData.map(d => d.weight),
      borderColor: CHART_COLORS[0],
      backgroundColor: CHART_GRADIENTS[0],
      borderWidth: 2,
      fill: true,
      tension: 0.3,
      pointRadius: 4,
      pointBackgroundColor: CHART_COLORS[0],
      pointBorderColor: "#0a0a0a",
      pointBorderWidth: 2,
    }]
  }), [weightData])

  const strengthChartData = useMemo(() => {
    const groups = muscleGroups.slice(0, 6)
    const dates = [...new Set(strengthData.slice(-50).map(d => d.date))]
    return {
      labels: dates,
      datasets: groups.map((group, i) => {
        const groupData = strengthData.filter(d => d.muscleGroup === group)
        const maxPerDate = groupData.reduce((acc, d) => {
          if (!acc[d.date] || d.oneRM > acc[d.date]) acc[d.date] = d.oneRM
          return acc
        }, {} as Record<string, number>)
        return {
          label: group,
          data: dates.map(date => maxPerDate[date] || null),
          borderColor: CHART_COLORS[i],
          backgroundColor: CHART_GRADIENTS[i],
          borderWidth: 2,
          fill: false,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: CHART_COLORS[i],
          pointBorderColor: "#0a0a0a",
          pointBorderWidth: 2,
        }
      })
    }
  }, [strengthData, muscleGroups])

  const volumeChartData = useMemo(() => {
    const groups = muscleGroups
    const dates = [...new Set(volumeData.slice(-28).map(d => d.date))].reverse()
    return {
      labels: dates,
      datasets: groups.map((group, i) => ({
        label: group,
        data: dates.map(date => {
          const d = volumeData.find(v => v.date === date && v.muscleGroup === group)
          return d?.volume || 0
        }),
        backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
        borderRadius: { topRight: 4, bottomRight: 4 }
      }))
    }
  }, [volumeData, muscleGroups])

  return (
    <div className="min-h-screen bg-mmrgb-bg">
      <header className="sticky top-0 z-40 bg-mmrgb-bg/80 backdrop-blur-xl border-b border-mmrgb-border">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-mmrgb-text">Progress</h1>
          <div className="flex gap-2 mt-3 overflow-x-auto">
            {(["week", "month", "3month", "year", "all"] as const).map(range => (
              <button key={range} onClick={() => setTimeRange(range)} className={clsx(
                "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                timeRange === range ? "bg-mmrgb-primary text-mmrgb-bg" : "bg-mmrgb-surfaceElevated text-mmrgb-textMuted hover:text-mmrgb-text"
              )}>
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>
      <div className="p-4 pb-32 space-y-4">
        {profile && targets && (
          <div className="grid grid-cols-2 gap-3">
            <Card padding="lg" className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="w-6 h-6 text-mmrgb-primary" />
                <span className="text-sm font-medium text-mmrgb-textMuted">Current Weight</span>
              </div>
              <p className="text-4xl font-bold text-mmrgb-text">{toNum(bodyWeightHistory[bodyWeightHistory.length - 1]?.weight) || toNum(profile.weight)}kg</p>
              <p className="text-sm text-mmrgb-textMuted mt-1">BMI: {targets.bmi}</p>
            </Card>
            <Card padding="lg" className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Dumbbell className="w-6 h-6 text-mmrgb-secondary" />
                <span className="text-sm font-medium text-mmrgb-textMuted">Total Workouts</span>
              </div>
              <p className="text-4xl font-bold text-mmrgb-text">{Object.values(dailyLogs).filter(l => l.workouts && l.workouts.length > 0).length}</p>
            </Card>
          </div>
        )}
        <Tabs tabs={[

          { id: "weight", label: "Weight", icon: <Activity className="w-4 h-4" /> },
          { id: "strength", label: "Strength", icon: <TrendingUp className="w-4 h-4" /> },
          { id: "volume", label: "Volume", icon: <Dumbbell className="w-4 h-4" /> },
          { id: "recovery", label: "Recovery", icon: <RotateCcw className="w-4 h-4" /> }
        ]} activeTab="" onChange={() => {}} variant="underline" className="px-4" />
        {weightData.length > 0 && (
          <Card padding="lg">
            <h2 className="text-lg font-bold text-mmrgb-text mb-4">Weight Trend</h2>
            <div className="h-64">
              <Line data={weightChartData} options={chartOptions} />
            </div>
          </Card>
        )}
        {(strengthData.length > 0 || volumeData.length > 0) && (
          <>
            <Card padding="lg">
              <h2 className="text-lg font-bold text-mmrgb-text mb-4">1RM Progression</h2>
              <div className="h-64">
                <Line data={strengthChartData} options={chartOptions} />
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {muscleGroups.slice(0, 6).map((group, i) => (
                  <div key={group} className="flex items-center gap-2 px-3 py-1 bg-mmrgb-surfaceElevated rounded-full">
                    <span className="w-3 h-3 rounded-full" style={{ background: CHART_COLORS[i] }} />
                    <span className="text-sm text-mmrgb-text">{group}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card padding="lg">
              <h2 className="text-lg font-bold text-mmrgb-text mb-4">Weekly Volume by Muscle Group</h2>
              <div className="h-64">
                <Bar data={volumeChartData} options={{ ...chartOptions, indexAxis: "y" }} />
              </div>
            </Card>
          </>
        )}
        {recoveryData.length > 0 && (
          <Card padding="lg">
            <h2 className="text-lg font-bold text-mmrgb-text mb-4">Muscle Recovery Heatmap</h2>
            <p className="text-sm text-mmrgb-textMuted mb-4">Green = Ready to train - Red = Still recovering</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {recoveryData.map(item => (
                <div key={item.group} className={clsx(
                  "p-4 rounded-xl text-center transition-all",
                  item.recovered ? "bg-green-500/10 border border-green-500/30" : "bg-red-500/10 border border-red-500/30"
                )}>
                  <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: item.color + "20", border: "2px solid " + (item.recovered ? "#00ff88" : "#ff3366") }}>
                    <Dumbbell className="w-8 h-8" style={{ color: item.color }} />
                  </div>
                  <h3 className="font-bold text-mmrgb-text">{item.group}</h3>
                  <p className="text-sm mt-1" style={{ color: item.recovered ? "#00ff88" : "#ff3366" }}>
                    {item.recovered ? "Ready" : item.daysSince + "d ago"}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
        {(weightData.length === 0 && strengthData.length === 0) && (
          <Card padding="lg" className="text-center">
            <TrendingUp className="w-12 h-12 text-mmrgb-textDim mx-auto mb-4" />
            <p className="text-mmrgb-textMuted mb-4">Start tracking to see your progress</p>
            <p className="text-xs text-mmrgb-textDim">Log workouts and body weight to unlock charts</p>
          </Card>
        )}
      </div>
    </div>
  )
}
