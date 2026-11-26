import { useEffect } from "react"
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom"
import { useStore } from "./store"
import { OnboardingScreen } from "./screens/OnboardingScreen"
import { DashboardScreen } from "./screens/DashboardScreen"
import { NutritionScreen } from "./screens/NutritionScreen"
import { WorkoutScreen } from "./screens/WorkoutScreen"
import { ProgressScreen } from "./screens/ProgressScreen"
import { SettingsScreen } from "./screens/SettingsScreen"
import { Home, Utensils, Dumbbell, TrendingUp, Settings } from "lucide-react"
import { clsx } from "clsx"

const NAV_ITEMS = [
  { id: "dashboard", label: "Today", icon: Home },
  { id: "nutrition", label: "Food", icon: Utensils },
  { id: "workout", label: "Train", icon: Dumbbell },
  { id: "progress", label: "Progress", icon: TrendingUp },
  { id: "settings", label: "Settings", icon: Settings }
] as const

function AppContent() {
  const { isOnboarded, currentScreen, setScreen } = useStore()
  const navigate = useNavigate()
  const location = useLocation()

  // Sync store with URL changes (back/forward navigation)
  useEffect(() => {
    const screen = location.pathname.slice(1) || "dashboard"
    if (NAV_ITEMS.some(item => item.id === screen)) {
      setScreen(screen as any)
    }
  }, [location, setScreen])

  if (!isOnboarded) {
    return <OnboardingScreen />
  }
  return (
    <>
      <main className="flex-1 overflow-y-auto pb-40 pb-safe">
        <Routes>
        <Route path="/dashboard" element={<DashboardScreen />} />
        <Route path="/nutrition" element={<NutritionScreen />} />
        <Route path="/workout" element={<WorkoutScreen />} />
        <Route path="/progress" element={<ProgressScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/" element={<DashboardScreen />} />
        </Routes>
      </main>
      {/* Bottom Navigation - with safe area support */}
      <nav className="fixed bottom-0 left-0 right-0 bg-mmrgb-bg/95 backdrop-blur-xl border-t border-mmrgb-border z-50 safe-bottom">
        <div className="flex items-center justify-around h-16 min-h-[4.5rem] pb-safe">
          {NAV_ITEMS.map(item => (
            <button 
              key={item.id} 
              onClick={() => navigate("/" + item.id)}
              className={clsx("flex flex-col items-center gap-1 px-4 py-2 transition-all min-h-[44px] min-w-[44px]", currentScreen === item.id ? "text-mmrgb-primary" : "text-mmrgb-textMuted")}
            >
              <item.icon className={clsx("w-6 h-6", currentScreen === item.id && "text-mmrgb-primary")} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}
export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-dvh bg-mmrgb-bg flex flex-col">
        <AppContent />
      </div>
    </BrowserRouter>
  )
}
