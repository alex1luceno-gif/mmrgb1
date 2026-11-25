# MMRGB Changelog

## [1.1.0] - 2026-11-25

### Fixed
- **UI Layout Issue: Bottom Navigation Overlap**
  - Fixed cards and content overlapping with bottom navigation/action buttons across all pages
  - Added proper vertical scrolling to all screens by wrapping Routes in a <main className=" flex-1 overflow-y-auto pb-32\> container in App.tsx
 - Removed redundant min-h-screen from individual screen components (Dashboard, Nutrition, Workout, Progress, Settings)
 - Removed pb-40 padding from content containers since the main scroll container handles bottom spacing
 - Changed screen root divs from min-h-screen bg-mmrgb-bg to g-mmrgb-bg to prevent double full-height containers

### Modified Files
- src/App.tsx - Added scrollable main container with proper bottom padding (pb-32 = 128px for bottom nav)
- src/screens/DashboardScreen.tsx - Removed min-h-screen, changed pb-40 to space-y-4
- src/screens/NutritionScreen.tsx - Removed min-h-screen, changed pb-40 to space-y-4
- src/screens/WorkoutScreen.tsx - Removed min-h-screen, changed pb-40 to space-y-4 (both active workout and routine list views)
- src/screens/ProgressScreen.tsx - Removed min-h-screen, changed pb-40 to space-y-4
- src/screens/SettingsScreen.tsx - Removed min-h-screen, changed pb-40 to space-y-4
- src/screens/OnboardingScreen.tsx - Updated flex container structure

### Technical Details
- The root App component now uses lex flex-col on the main container
- A <main className=\flex-1 overflow-y-auto pb-32\> wraps all routed screens
- Bottom navigation remains ixed bottom-0 with z-50
- The pb-32 (128px) provides sufficient clearance for the bottom nav (h-16 = 64px + safe area)
- Each screen's content container now uses simple p-4 space-y-4 without explicit bottom padding
- This allows natural scrolling when content exceeds viewport height

### Build
- Verified successful TypeScript compilation ( sc -b)
- Verified successful Vite production build (ite build)
- Output: ~545kB JS bundle, ~41kB CSS

---

## [1.0.0] - Initial Release
- Original MMRGB fitness tracking application
- Features: Dashboard, Nutrition logging, Workout routines, Progress charts, Settings
- Onboarding flow with profile setup
- Local storage persistence
- PWA support
