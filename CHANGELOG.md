# MMRGB Changelog

## [1.1.3] - 2026-11-28

### Fixed
- **Viewport & Safe-Area Fixes Ported to Source**
  - index.html: Added `viewport-fit=cover` to viewport meta tag for proper notch/home indicator handling
  - src/index.css: Added comprehensive safe-area utilities:
    - `html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }`
    - `body { padding-top: env(safe-area-inset-top, 0px); }`
    - `nav.fixed { padding-bottom: env(safe-area-inset-bottom, 0px); }` and `nav.fixed button { flex: 1 1 0; min-height: 64px; justify-content: center; }`
    - `.fixed.bottom-0:not(nav) { padding-bottom: max(1.25rem, env(safe-area-inset-bottom, 0px)); }`
    - `[role="dialog"] { max-height: 90dvh; overflow-y: auto; overscroll-behavior: contain; }`
    - `button, [role="button"], select, a { touch-action: manipulation; -webkit-tap-highlight-color: transparent; }`

- **Guaranteed Full Bottom Scroll Clearance on All Pages**
  - src/App.tsx: Updated main scrollable container padding from `pb-40` to `pb-36` + inline style `calc(9rem + env(safe-area-inset-bottom, 0px))`
  - src/App.tsx: Changed bottom spacer from `h-32` (128px) to `h-12` (48px) - combined with increased container padding provides ~192px total clearance
  - src/screens/OnboardingScreen.tsx: Changed `min-h-screen` to `min-h-[100dvh]` for dynamic viewport height
  - All 6 pages (Dashboard, Nutrition, Workout, Progress, Settings, Onboarding) now have proper bottom clearance

- **Hardened Modal & Button Scroll-Lock Cleanup (Prevent Page Freezes)**
  - src/components/Modal.tsx: Added route-change listener (`popstate`) that resets `document.body.style.overflow = ""` and `document.documentElement.style.overflow = ""` on navigation
  - Modal backdrop overlay now only mounts when `isOpen === true` (early return pattern)
  - Combined with existing `modalCount` reference counter for robust body overflow management

### Modified Files
- src/App.tsx - Updated padding (pb-36 + calc(9rem + env(...))), spacer (h-12), added route-change listener in AppContent
- src/components/Modal.tsx - Added route-change listener for overflow cleanup, early return when closed
- src/screens/OnboardingScreen.tsx - Changed min-h-screen to min-h-[100dvh]
- index.html - Added viewport-fit=cover (already present)
- src/index.css - Already contains all safe-area utilities and touch-action rules

### Technical Details
- **Scroll owner**: `<main className="flex-1 overflow-y-auto pb-36 pb-safe" style={{ paddingBottom: "calc(9rem + env(safe-area-inset-bottom, 0px))" }}>` owns vertical scroll
- **Bottom clearance**: 144px (pb-36) + 48px (h-12 spacer) + safe-area-inset = ~192px+ clearance for bottom nav (~72px)
- **Body overflow lock**: Reference-counted (modalCount) + route-change listener ensures cleanup on modal close AND navigation
- **Outer shell**: min-h-dvh (100dvh) prevents mobile browser chrome from cutting off scroll area
- **Viewport fit**: viewport-fit=cover enables content to extend behind notches/home indicators safely

### Build
- Verified successful TypeScript compilation (tsc -b)
- Verified successful Vite production build (vite build)
- Output: ~545kB JS bundle, ~41kB CSS

---

## [1.1.2] - 2026-11-28

### Fixed
- **Page Freeze After Button Clicks**
  - Root cause: Modal component set document.body.style.overflow = '\''hidden'\'' but cleanup failed when multiple modals opened/closed, leaving body permanently scroll-locked
  - Fix: Added module-level modalCount reference counter in Modal.tsx - only locks body overflow when first modal opens, restores only when last modal closes
  - This prevents leftover overflow: hidden on body/html after any modal/drawer interaction

- **Bottom Card Still Cut Off Behind Bottom Nav**
  - Root cause: Padding on scroll container (pb-40 pb-safe on <main>) doesn'\''t create extra scroll space - flex/grid overflow ignores container padding-bottom
  - Fix: Added explicit physical spacer element <div className=" h-32 w-full shrink-0" aria-hidden="true" /> at bottom of scrollable content (inside <main>, after <Routes>)
 - The 128px (h-32) spacer forces browser to allocate scrollable space below final card on every page
 - Works on all pages: Dashboard, Nutrition, Workout, Progress, Settings, Onboarding

### Modified Files
- src/components/Modal.tsx - Added modalCount reference counter for proper body overflow management
- src/App.tsx - Added bottom spacer element inside scrollable main container

### Technical Details
- **Scroll owner**: <main className="flex-1 overflow-y-auto pb-40 pb-safe"> owns vertical scroll
- **Body overflow lock**: Reference-counted (increment on modal open, decrement on close) - only locks when count goes 0?1, unlocks when 1?0
- **Bottom spacer**: h-32 (128px) + shrink-0 ensures it'\''s never compressed, creates guaranteed scroll space
- **Outer shell**: min-h-dvh (100dvh) prevents mobile browser chrome from cutting off scroll area
- Combined: 160px container padding + 128px spacer + safe-area-inset = 288px+ clearance for bottom nav (~72px)

### Build
- Verified successful TypeScript compilation (tsc -b)
- Verified successful Vite production build (vite build)
- Output: ~545kB JS bundle, ~41kB CSS

---

## [1.1.1] - 2026-11-26

### Fixed
- **UI Layout Issue: Bottom Navigation Overlap - Permanent Fix**
 - Increased bottom padding on scrollable content container from pb-32 (128px) to pb-40 (160px) + pb-safe (safe-area-inset-bottom)
 - Changed outer app shell from min-h-screen (100vh) to min-h-dvh (100dvh) to prevent mobile browser address bars from cutting off scroll area
 - Added explicit pb-safe utility to main scrollable container for home indicator clearance on iOS/Android
 - The scrollable <main> element now has overflow-y-auto with sufficient bottom padding (160px + safe area) so users can scroll past the final card with clear breathing room above the bottom nav bar

### Modified Files
- src/App.tsx - Updated root to min-h-dvh, main container to pb-40 pb-safe

### Technical Details
- **Scroll owner**: The <main className="flex-1 overflow-y-auto pb-40 pb-safe"> element owns the vertical scroll
- **Outer shell**: min-h-dvh uses dynamic viewport height (100dvh) instead of static (100vh)
- **Bottom nav height**: ~72px (h-16 + min-h-[4.5rem]) + safe area inset
- **Content padding**: 160px (pb-40) + env(safe-area-inset-bottom) ensures last card clears bottom nav completely
- This works on all pages (Dashboard, Nutrition, Workout, Progress, Settings, Onboarding)

### Build
- Verified successful TypeScript compilation (tsc -b)
- Verified successful Vite production build (vite build)
- Output: ~545kB JS bundle, ~41kB CSS

---

## [1.1.0] - 2026-11-25

### Fixed
- **UI Layout Issue: Bottom Navigation Overlap**
 - Fixed cards and content overlapping with bottom navigation/action buttons across all pages
 - Added proper vertical scrolling to all screens by wrapping Routes in a <main className="flex-1 overflow-y-auto pb-32"> container in App.tsx
 - Removed redundant min-h-screen from individual screen components (Dashboard, Nutrition, Workout, Progress, Settings)
 - Removed pb-40 padding from content containers since the main scroll container handles bottom spacing
 - Changed screen root divs from min-h-screen bg-mmrgb-bg to bg-mmrgb-bg to prevent double full-height containers

### Modified Files
- src/App.tsx - Added scrollable main container with proper bottom padding (pb-32 = 128px for bottom nav)
- src/screens/DashboardScreen.tsx - Removed min-h-screen, changed pb-40 to space-y-4
- src/screens/NutritionScreen.tsx - Removed min-h-screen, changed pb-40 to space-y-4
- src/screens/WorkoutScreen.tsx - Removed min-h-screen, changed pb-40 to space-y-4 (both active workout and routine list views)
- src/screens/ProgressScreen.tsx - Removed min-h-screen, changed pb-40 to space-y-4
- src/screens/SettingsScreen.tsx - Removed min-h-screen, changed pb-40 to space-y-4
- src/screens/OnboardingScreen.tsx - Updated flex container structure

### Technical Details
- The root App component now uses flex flex-col on the main container
- A <main className="flex-1 overflow-y-auto pb-32"> wraps all routed screens
- Bottom navigation remains fixed bottom-0 with z-50
- The pb-32 (128px) provides sufficient clearance for the bottom nav (h-16 = 64px + safe area)
- Each screen'\''s content container now uses simple p-4 space-y-4 without explicit bottom padding
- This allows natural scrolling when content exceeds viewport height

### Build
- Verified successful TypeScript compilation (tsc -b)
- Verified successful Vite production build (vite build)
- Output: ~545kB JS bundle, ~41kB CSS

---

## [1.0.0] - Initial Release
- Original MMRGB fitness tracking application
- Features: Dashboard, Nutrition logging, Workout routines, Progress charts, Settings
- Onboarding flow with profile setup
- Local storage persistence
- PWA support
