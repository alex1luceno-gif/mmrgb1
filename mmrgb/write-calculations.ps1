$content = @"
export const calculate1RM = (weight: number, reps: number): number => {
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30))
}

export const calculateRPE = (weight: number, reps: number, rpe: number): number => {
  const oneRM = calculate1RM(weight, reps)
  const rpeTable: Record<number, number> = {
    10: 1.0, 9.5: 0.97, 9: 0.94, 8.5: 0.91, 8: 0.88,
    7.5: 0.85, 7: 0.82, 6.5: 0.79, 6: 0.76, 5.5: 0.73, 5: 0.7
  }
  return Math.round(oneRM * (rpeTable[rpe] || 0.8))
}

export const getPlateMath = (targetWeight: number, barWeight: number = 20): { plates: Record<number, number>; totalWeight: number } => {
  const platesAvailable = [25, 20, 15, 10, 5, 2.5, 1.25]
  const weightPerSide = (targetWeight - barWeight) / 2
  if (weightPerSide <= 0) return { plates: {}, totalWeight: barWeight }
  const plates: Record<number, number> = {}
  let remaining = weightPerSide
  for (const plate of platesAvailable) {
    const count = Math.floor(remaining / plate)
    if (count > 0) { plates[plate] = count; remaining -= count * plate }
  }
  const calculatedPerSide = Object.entries(plates).reduce((sum, [plate, count]) => sum + Number(plate) * count, 0)
  const totalWeight = barWeight + calculatedPerSide * 2
  return { plates, totalWeight }
}

export const formatWeight = (weight: number, unit: 'kg' | 'lb' = 'kg'): string => {
  if (unit === 'lb') return `\${Math.round(weight * 2.20462)}lb`
  return weight % 1 === 0 ? `\${weight}kg` : `\${weight.toFixed(1)}kg`
}

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `\${secs}s`
  return `\${mins}:\${secs.toString().padStart(2, '0')}`
}

export const getMuscleGroupColor = (group: string): string => {
  const colors: Record<string, string> = {
    chest: '#00ff88', back: '#00d4ff', shoulders: '#ffaa00',
    arms: '#ff3366', legs: '#aa66ff', core: '#00ffcc', cardio: '#ff6600'
  }
  return colors[group.toLowerCase()] || '#888888'
}

export const getWeekStart = (date: Date = new Date()): Date => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export const getWeekDates = (weekStart: Date): Date[] => {
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(d.getDate() + i); return d })
}

export const formatDate = (date: Date): string => { return date.toISOString().split('T')[0] }

export const formatDateDisplay = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}
"@
[System.IO.File]::WriteAllText('C:\Users\Lenovo\Downloads\Documents\hobbyvcode\mmrgb\src\utils\calculations.ts', $content)
Write-Host 'utils/calculations.ts written'
