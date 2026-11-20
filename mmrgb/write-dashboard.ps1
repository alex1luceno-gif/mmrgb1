$content = @"
import React, { useState, useEffect } from 'react'
import { useStore } from '../store'
import { ProgressRing } from '../components/ProgressRing'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { Slider } from '../components/Slider'
import { Plus, Minus, Check, Moon, Zap, Dumbbell, Brain, TrendingUp, Settings, ChevronDown, X, Clock, Flame, Target } from 'lucide-react'
import { clsx } from 'clsx'
import { formatDateDisplay, getWeekStart } from '../utils/calculations'

export const DashboardScreen: React.FC = () => {
  const { profile, targets, getTodaysCalories, getTodaysProtein, getTodaysWater, isCreatineTakenToday, addCreatineEntry, addWaterEntry, addSleepEntry, addSorenessEntry, setScreen, currentScreen } = useStore()
  const [showSleepModal, setShowSleepModal] = useState(false)
  const [showSorenessModal, setShowSorenessModal] = useState(false)
  const [sleepHours, setSleepHours] = useState(7.5)
  const [sleepQuality, setSleepQuality] = useState(4)
  const [sorenessGroups, setSorenessGroups] = useState<string[]>([])
  const [readiness, setReadiness] = useState(75)
  const muscleGroups = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core']

  const calorieProgress = targets ? Math.min(getTodaysCalories() / targets.calories, 1) : 0
  const proteinProgress = targets ? Math.min(getTodaysProtein() / targets.protein, 1) : 0
  const waterProgress = Math.min(getTodaysWater() / 3000, 1)

  const handleQuickAddProtein = () => { /* Would open food logger with protein preset */ }
  const handleQuickAddWater = () => { addWaterEntry({ id: Date.now().toString(), amount: 500, date: new Date() }) }
  const handleCreatineToggle = () => { addCreatineEntry({ id: Date.now().toString(), taken: !isCreatineTakenToday(), date: new Date() }) }
  const handleSleepSubmit = () => { addSleepEntry({ id: Date.now().toString(), hours: sleepHours, quality: sleepQuality as 1|2|3|4|5, date: new Date() }); setShowSleepModal(false) }
  const handleSorenessSubmit = () => { sorenessGroups.forEach(group => { addSorenessEntry({ id: Date.now().toString() + group, muscleGroup: group, level: 3 as 1|2|3|4|5, date: new Date() }) }); setSorenessGroups([]); setShowSorenessModal(false) }
  const toggleSorenessGroup = (group: string) => { setSorenessGroups(prev => prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]) }

  if (!profile || !targets) return null

  return (
    <div className='min-h-screen bg-mmrgb-bg'>
      <header className='sticky top-0 z-40 bg-mmrgb-bg/80 backdrop-blur-xl border-b border-mmrgb-border'>
        <div className='p-4 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-mmrgb-text'>MMRGB</h1>
            <p className='text-sm text-mmrgb-textMuted'>{formatDateDisplay(new Date())}</p>
          </div>
          <button onClick={() => setScreen('settings')} className='p-2 rounded-xl text-mmrgb-textMuted hover:text-mmrgb-text hover:bg-mmrgb-surfaceElevated transition-colors'>
            <Settings className='w-6 h-6' />
          </button>
        </div>
      </header>
      <div className='p-4 pb-28 space-y-4'>
        <div className='grid grid-cols-2 gap-3'>
          <Card className='relative overflow-hidden'>
            <div className='flex items-start justify-between mb-4'>
              <div>
                <p className='text-sm text-mmrgb-textMuted'>Daily Calories</p>
                <p className='text-2xl font-bold text-mmrgb-text tabular-nums'>{getTodaysCalories()} / {targets.calories}</p>
              </div>
              <div className='w-16 h-16 bg-gradient-to-br from-mmrgb-primary/20 to-transparent rounded-xl flex items-center justify-center'>
                <Flame className='w-7 h-7 text-mmrgb-primary' />
              </div>
            </div>
            <ProgressRing progress={calorieProgress} size={100} strokeWidth={8} color='#00ff88' bgColor='#2a2a2a'>
              <div className='text-center'>
                <p className='text-2xl font-bold text-mmrgb-text'>{Math.round(calorieProgress * 100)}%</p>
                <p className='text-xs text-mmrgb-textMuted'>of target</p>
              </div>
            </ProgressRing>
          </Card>
          <Card className='relative overflow-hidden'>
            <div className='flex items-start justify-between mb-4'>
              <div>
                <p className='text-sm text-mmrgb-textMuted'>Daily Protein</p>
                <p className='text-2xl font-bold text-mmrgb-text tabular-nums'>{getTodaysProtein()} / {targets.protein}g</p>
              </div>
              <div className='w-16 h-16 bg-gradient-to-br from-mmrgb-secondary/20 to-transparent rounded-xl flex items-center justify-center'>
                <Target className='w-7 h-7 text-mmrgb-secondary' />
              </div>
            </div>
            <ProgressRing progress={proteinProgress} size={100} strokeWidth={8} color='#00d4ff' bgColor='#2a2a2a'>
              <div className='text-center'>
                <p className='text-2xl font-bold text-mmrgb-text'>{Math.round(proteinProgress * 100)}%</p>
                <p className='text-xs text-mmrgb-textMuted'>of target</p>
              </div>
            </ProgressRing>
          </Card>
        </div>
        <Card padding='lg'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-bold text-mmrgb-text'>Quick Actions</h2>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <Button variant='secondary' onClick={handleQuickAddProtein} className='h-20 flex flex-col gap-2'>
              <Plus className='w-6 h-6' />
              <span className='text-sm'>+25g Protein</span>
            </Button>
            <Button variant='secondary' onClick={handleQuickAddWater} className='h-20 flex flex-col gap-2'>
              <Plus className='w-6 h-6' />
              <span className='text-sm'>+500ml Water</span>
            </Button>
            <Button variant={isCreatineTakenToday() ? 'primary' : 'secondary'} onClick={handleCreatineToggle} className='h-20 flex flex-col gap-2'>
              <Check className='w-6 h-6' />
              <span className='text-sm'>{isCreatineTakenToday() ? 'Creatine ?' : 'Creatine'}</span>
            </Button>
            <Button variant='secondary' onClick={() => setShowSleepModal(true)} className='h-20 flex flex-col gap-2'>
              <Moon className='w-6 h-6' />
              <span className='text-sm'>Log Sleep</span>
            </Button>
          </div>
        </Card>
        <Card padding='lg'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-bold text-mmrgb-text'>Readiness</h2>
            <div className='flex items-center gap-2 text-sm text-mmrgb-textMuted'>
              <Brain className='w-4 h-4' />
              <span>{readiness}%</span>
            </div>
          </div>
          <Slider label='How ready do you feel?' min={0} max={100} value={readiness} onChange={setReadiness} unit='%' />
          <div className='grid grid-cols-2 gap-3 mt-4'>
            <button onClick={() => setShowSorenessModal(true)} className='flex items-center gap-2 p-3 rounded-xl bg-mmrgb-surfaceElevated border border-mmrgb-border text-left transition-colors hover:border-mmrgb-textMuted'>
              <Zap className='w-5 h-5 text-mmrgb-warning' />
              <span className='text-sm text-mmrgb-text'>Soreness</span>
            </button>
            <div className='flex items-center gap-2 p-3 rounded-xl bg-mmrgb-surfaceElevated border border-mmrgb-border'>
              <TrendingUp className='w-5 h-5 text-mmrgb-primary' />
              <span className='text-sm text-mmrgb-text'>{readiness >= 70 ? 'Ready to Train' : 'Consider Recovery'}</span>
            </div>
          </div>
        </Card>
        <Card padding='lg'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-bold text-mmrgb-text'>Water Intake</h2>
            <p className='text-sm text-mmrgb-textMuted'>{getTodaysWater()} / 3000ml</p>
          </div>
          <ProgressRing progress={waterProgress} size={80} strokeWidth={6} color='#00d4ff' bgColor='#2a2a2a'>
            <div className='text-center'>
              <p className='text-xl font-bold text-mmrgb-text'>{Math.round(waterProgress * 100)}%</p>
            </div>
          </ProgressRing>
          <div className='flex justify-center gap-2 mt-4'>
            {Array.from({ length: 6 }, (_, i) => (
              <button key={i} onClick={() => addWaterEntry({ id: Date.now().toString() + i, amount: 250, date: new Date() })} className={clsx(
                'w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all',
                i < Math.floor(getTodaysWater() / 250) ? 'bg-mmrgb-secondary/20 border-mmrgb-secondary' : 'border-mmrgb-border'
              )}>
                <span className='text-xs text-mmrgb-textMuted'>{250}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
      <Modal isOpen={showSleepModal} onClose={() => setShowSleepModal(false)} title='Log Sleep'>
        <div className='space-y-4'>
          <Slider label='Hours Slept' min={0} max={12} step={0.5} value={sleepHours} onChange={setSleepHours} unit='h' />
          <div>
            <label className='block text-sm font-medium text-mmrgb-textMuted mb-2'>Sleep Quality</label>
            <div className='flex gap-2'>
              {Array.from({ length: 5 }, (_, i) => (
                <button key={i} onClick={() => setSleepQuality(i + 1)} className={clsx(
                  'flex-1 h-10 rounded-xl border-2 font-bold transition-all',
                  sleepQuality > i ? 'bg-mmrgb-primary/20 border-mmrgb-primary text-mmrgb-primary' : 'border-mmrgb-border text-mmrgb-textMuted'
                )}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={handleSleepSubmit} fullWidth>Save</Button>
        </div>
      </Modal>
      <Modal isOpen={showSorenessModal} onClose={() => setShowSorenessModal(false)} title='Log Soreness'>
        <p className='text-mmrgb-textMuted text-sm mb-4'>Tap muscle groups that are sore</p>
        <div className='grid grid-cols-3 gap-2 mb-4'>
          {muscleGroups.map(group => (
            <button key={group} onClick={() => toggleSorenessGroup(group)} className={clsx(
              'p-3 rounded-xl border-2 text-sm font-medium transition-all',
              sorenessGroups.includes(group) ? 'bg-mmrgb-danger/20 border-mmrgb-danger text-mmrgb-danger' : 'border-mmrgb-border text-mmrgb-textMuted hover:border-mmrgb-textMuted'
            )}>
              {group}
            </button>
          ))}
        </div>
        <Button onClick={handleSorenessSubmit} disabled={sorenessGroups.length === 0} fullWidth>Log Soreness</Button>
      </Modal>
    </div>
  )
}
"@
[System.IO.File]::WriteAllText('C:\Users\Lenovo\Downloads\Documents\hobbyvcode\mmrgb\src\screens\DashboardScreen.tsx', $content)
Write-Host 'DashboardScreen.tsx written'
