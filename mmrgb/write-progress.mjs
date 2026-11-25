import fs from "fs";

const progress = `import React, { useState } from "react"
import { useStore } from "../store"
import { Card } from "../components/Card"
import { Tabs } from "../components/Tabs"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar
} from "recharts"
import { Dumbbell, TrendingUp, Target, Activity, RotateCcw } from "lucide-react"
import { clsx } from "clsx"
import { formatDate, formatDateDisplay, calculate1RM, getMuscleGroupColor } from "../utils/calculations"

const CHART_COLORS = ["#00ff88", "#00d4ff", "#ffaa00", "#ff3366", "#aa66ff", "#00ffcc"]

export const ProgressScreen: React.FC = () => {
  const { bodyWeightHistory, dailyLogs, targets, profile } = useStore()
  const [timeRange, setTimeRange] = useState<"week" | "month" | "3month" | "year" | "all">("month")

  const weightData = bodyWeightHistory.map((entry, i) => ({
    date: formatDateDisplay(entry.date),
    weight: entry.weight,
    rawDate: entry.date
  })).slice(-30)

  const strengthData = Object.values(dailyLogs)
    .filter(log => log.workout)
    .flatMap(log => log.workout!.exercises.flatMap(ex => ex.sets.filter(s => s.completed).map(s => ({
      date: formatDateDisplay(log.workout!.startedAt),
      exercise: ex.name,
      weight: s.weight,
      reps: s.reps,
      oneRM: calculate1RM(s.weight, s.reps),
      muscleGroup: ex.muscleGroup,
      rawDate: log.workout!.startedAt
    }))))
    .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime())

  const volumeData = Object.values(dailyLogs)
    .filter(log => log.workout)
    .flatMap(log => log.workout!.exercises.map(ex => ({
      date: formatDate(log.workout!.startedAt),
      muscleGroup: ex.muscleGroup,
      volume: ex.sets.filter(s => s.completed).reduce((sum, s) => sum + s.weight * s.reps, 0),
      rawDate: log.workout!.startedAt
    })))
    .reduce((acc, curr) => {
      const existing = acc.find(d => d.date === curr.date && d.muscleGroup === curr.muscleGroup)
      if (existing) existing.volume += curr.volume
      else acc.push({ ...curr })
      return acc
    }, [] as { date: string; muscleGroup: string; volume: number; rawDate: Date }[])
    .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime())

  const muscleGroups = [...new Set(strengthData.map(d => d.muscleGroup))]

  const recoveryData = muscleGroups.map((group) => {
    const lastWorkout = strengthData.filter(d => d.muscleGroup === group).pop()
    if (!lastWorkout) return { group, daysSince: 99, recovered: true, color: getMuscleGroupColor(group) }
    const daysSince = Math.floor((Date.now() - lastWorkout.rawDate.getTime()) / (1000 * 60 * 60 * 24))
    return { group, daysSince, recovered: daysSince >= 2, color: getMuscleGroupColor(group) }
  })

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-mmrgb-surface border border-mmrgb-border rounded-xl p-3 shadow-lg">
          <p className="font-bold text-mmrgb-text">{label}</p>
          {payload.map((entry: any, i: number) => (
            <p key={i} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}{entry.name.includes("Weight") ? "kg" : entry.name.includes("Volume") ? "kg" : ""}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const formatXLabel = (value: string) => {
    const date = new Date(value)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

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
      <div className="p-4 pb-28 space-y-4">
        {profile && targets && (
          <div className="grid grid-cols-2 gap-3">
            <Card padding="lg" className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="w-6 h-6 text-mmrgb-primary" />
                <span className="text-sm font-medium text-mmrgb-textMuted">Current Weight</span>
              </div>
              <p className="text-4xl font-bold text-mmrgb-text">{bodyWeightHistory[bodyWeightHistory.length - 1]?.weight || profile.weight}kg</p>
              <p className="text-sm text-mmrgb-textMuted mt-1">BMI: {targets.bmi}</p>
            </Card>
            <Card padding="lg" className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Dumbbell className="w-6 h-6 text-mmrgb-secondary" />
                <span className="text-sm font-medium text-mmrgb-textMuted">Total Workouts</span>
              </div>
              <p className="text-4xl font-bold text-mmrgb-text">{Object.values(dailyLogs).filter(l => l.workout).length}</p>
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
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weightData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                  <XAxis dataKey="date" stroke="#555555" fontSize={12} tickFormatter={formatXLabel} interval="preserveStartEnd" />
                  <YAxis stroke="#555555" fontSize={12} tick={{ fill: "#888888" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="weight" stroke="#00ff88" strokeWidth={2} fillOpacity={1} fill="url(#weightGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
        {(strengthData.length > 0 || volumeData.length > 0) && (
          <>
            <Card padding="lg">
              <h2 className="text-lg font-bold text-mmrgb-text mb-4">1RM Progression</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={strengthData.slice(-50)} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                    <XAxis dataKey="date" stroke="#555555" fontSize={12} tickFormatter={formatXLabel} interval="preserveStartEnd" />
                    <YAxis stroke="#555555" fontSize={12} tick={{ fill: "#888888" }} />
                    <Tooltip content={<CustomTooltip />} />
                    {muscleGroups.slice(0, 6).map((group, i) => {
                      const groupData = strengthData.filter(d => d.muscleGroup === group)
                      const maxPerDate = groupData.reduce((acc, d) => {
                        if (!acc[d.date] || d.oneRM > acc[d.date]) acc[d.date] = d.oneRM
                        return acc
                      }, {} as Record<string, number>)
                      const chartData = Object.entries(maxPerDate).map(([date, oneRM]) => ({ date, oneRM }))
                      return (
                        <Line key={group} type="monotone" dataKey="oneRM" data={chartData} stroke={CHART_COLORS[i]} strokeWidth={2} dot={{ r: 4, fill: CHART_COLORS[i], strokeWidth: 2 }} name={group} />
                      )
                    })}
                  </LineChart>
                </ResponsiveContainer>
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
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeData.slice(-28)} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" horizontal={false} />
                    <XAxis type="number" stroke="#555555" fontSize={12} tick={{ fill: "#888888" }} />
                    <YAxis dataKey="date" type="category" stroke="#555555" fontSize={12} tickFormatter={formatXLabel} width={60} />
                    <Tooltip content={<CustomTooltip />} />
                    {muscleGroups.map((group, i) => {
                      const groupData = volumeData.filter(d => d.muscleGroup === group)
                      return (
                        <Bar key={group} dataKey="volume" data={groupData} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[0, 4, 4, 0]} name={group} stackId="a" />
                      )
                    })}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </>
        )}
        {recoveryData.length > 0 && (
          <Card padding="lg">
            <h2 className="text-lg font-bold text-mmrgb-text mb-4">Muscle Recovery Heatmap</h2>
            <p className="text-sm text-mmrgb-textMuted mb-4">Green = Ready to train â€¢ Red = Still recovering</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {recoveryData.map(item => (
                <div key={item.group} className={clsx(
                  "p-4 rounded-xl text-center transition-all",
                  item.recovered ? "bg-green-500/10 border border-green-500/30" : "bg-red-500/10 border border-red-500/30"
                )} onClick={() => {}} style={{ cursor: "pointer" }}>
                  <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: item.color + "20", border: "2px solid " + (item.recovered ? "#00ff88" : "#ff3366") }}>
                    <Dumbbell className="w-8 h-8" style={{ color: item.color }} />
                  </div>
                  <h3 className="font-bold text-mmrgb-text">{item.group}</h3>
                  <p className="text-sm mt-1" style={{ color: item.recovered ? "#00ff88" : "#ff3366" }}>
                    {item.recovered ? "✓ Ready" : item.daysSince + "d ago"}
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
`;

fs.writeFileSync("C:/Users/Lenovo/Downloads/Documents/hobbyvcode/mmrgb/src/screens/ProgressScreen.tsx", progress);
console.log("ProgressScreen.tsx written");
