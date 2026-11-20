import fs from "fs";

const onboarding = `import React, { useState } from "react"
import { useStore } from "../store"
import { Button } from "../components/Button"
import { Input } from "../components/Input"
import { ArrowRight, Dumbbell, Target, Users, Flame, Leaf } from "lucide-react"
import { clsx } from "clsx"

export const OnboardingScreen: React.FC = () => {
  const { setProfile, completeOnboarding } = useStore()
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState({
    height: 175,
    weight: 75,
    age: 25,
    gender: "male" as "male" | "female",
    activityLevel: "moderate" as "sedentary" | "light" | "moderate" | "very" | "extra",
    goal: "lean_bulk" as "lean_bulk" | "recomp" | "mini_cut"
  })

  const steps = [
    { title: "Body Stats", subtitle: "Tell us about yourself", icon: Users },
    { title: "Activity Level", subtitle: "How active are you?", icon: Flame },
    { title: "Goal", subtitle: "What are you working towards?", icon: Target }
  ]

  const activityOptions = [
    { value: "sedentary", label: "Sedentary", desc: "Little to no exercise" },
    { value: "light", label: "Light", desc: "Light exercise 1-3 days/week" },
    { value: "moderate", label: "Moderate", desc: "Moderate exercise 3-5 days/week" },
    { value: "very", label: "Very Active", desc: "Hard exercise 6-7 days/week" },
    { value: "extra", label: "Extra Active", desc: "Very hard exercise, physical job" }
  ]

  const goalOptions = [
    { value: "lean_bulk", label: "Lean Bulk", desc: "Build muscle, minimize fat gain", icon: Dumbbell, color: "#00ff88" },
    { value: "recomp", label: "Recomp", desc: "Build muscle & lose fat simultaneously", icon: Target, color: "#00d4ff" },
    { value: "mini_cut", label: "Mini Cut", desc: "Lose fat while preserving muscle", icon: Leaf, color: "#ffaa00" }
  ]

  const handleNext = () => {
    if (step < 2) { setStep(step + 1) }
    else { setProfile(formData); completeOnboarding() }
  }

  const handleBack = () => { if (step > 0) setStep(step - 1) }

  const isStepValid = () => {
    switch (step) {
      case 0: return formData.height > 0 && formData.weight > 0 && formData.age > 0
      case 1: return true
      case 2: return true
      default: return false
    }
  }

  return (
    <div className="min-h-screen bg-mmrgb-bg flex flex-col">
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-3">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={clsx(
                "w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold transition-all",
                i < step ? "bg-mmrgb-primary text-mmrgb-bg" :
                i === step ? "bg-mmrgb-primary/20 text-mmrgb-primary border border-mmrgb-primary" :
                "bg-mmrgb-surfaceElevated text-mmrgb-textMuted border border-mmrgb-border"
              )}>
                {i < step ? <ArrowRight className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
              </div>
              {i < steps.length - 1 && <div className={clsx("w-12 h-0.5 rounded", i < step ? "bg-mmrgb-primary" : "bg-mmrgb-border")} />}
            </div>
          ))}
        </div>
        <button onClick={handleBack} disabled={step === 0} className={clsx("p-2 rounded-xl text-mmrgb-textMuted hover:text-mmrgb-text hover:bg-mmrgb-surfaceElevated transition-colors", step === 0 && "invisible")}>
          <ArrowRight className="w-5 h-5 rotate-180" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-5 pb-24 animate-slide-up">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-mmrgb-text mb-1">{steps[step].title}</h1>
          <p className="text-mmrgb-textMuted mb-8">{steps[step].subtitle}</p>
          {step === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Height (cm)" type="number" value={formData.height} onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })} min={100} max={250} placeholder="175" />
                <Input label="Weight (kg)" type="number" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })} min={30} max={200} placeholder="75" />
              </div>
              <Input label="Age" type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })} min={13} max={100} placeholder="25" />
              <div>
                <label className="block text-sm font-medium text-mmrgb-textMuted mb-2">Gender</label>
                <div className="grid grid-cols-2 gap-3">
                  {["male", "female"].map((g) => (
                    <button key={g} type="button" onClick={() => setFormData({ ...formData, gender: g as "male" | "female" })} className={clsx(
                      "p-4 rounded-xl border-2 text-sm font-medium transition-all",
                      formData.gender === g ? "border-mmrgb-primary bg-mmrgb-primary/10 text-mmrgb-primary" : "border-mmrgb-border text-mmrgb-textMuted hover:border-mmrgb-textMuted"
                    )}>
                      {g === "male" ? "♂" : "♀"} {g.charAt(0).toUpperCase() + g.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-3">
              {activityOptions.map((opt) => (
                <button key={opt.value} type="button" onClick={() => setFormData({ ...formData, activityLevel: opt.value as typeof formData.activityLevel })} className={clsx(
                  "w-full p-4 rounded-xl border-2 text-left transition-all",
                  formData.activityLevel === opt.value ? "border-mmrgb-primary bg-mmrgb-primary/10" : "border-mmrgb-border hover:border-mmrgb-textMuted"
                )}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-mmrgb-text">{opt.label}</p>
                      <p className="text-sm text-mmrgb-textMuted">{opt.desc}</p>
                    </div>
                    {formData.activityLevel === opt.value && (
                      <svg className="w-5 h-5 text-mmrgb-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
          {step === 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {goalOptions.map((opt) => (
                <button key={opt.value} type="button" onClick={() => setFormData({ ...formData, goal: opt.value as typeof formData.goal })} className={clsx(
                  "p-5 rounded-2xl border-2 text-center transition-all relative overflow-hidden",
                  formData.goal === opt.value ? "border-mmrgb-primary bg-mmrgb-primary/10" : "border-mmrgb-border hover:border-mmrgb-textMuted"
                )} style={{ background: formData.goal === opt.value ? "linear-gradient(135deg, " + opt.color + " 0%, " + opt.color + "cc 100%)" : undefined }}>
                  <div className="relative z-10">
                    <div className={clsx("w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center",
                      formData.goal === opt.value ? "bg-mmrgb-primary text-mmrgb-bg" : "bg-mmrgb-surfaceElevated text-mmrgb-textMuted"
                    )}>
                      <opt.icon className={clsx("w-6 h-6", formData.goal === opt.value ? "text-mmrgb-bg" : "text-mmrgb-textMuted")} />
                    </div>
                    <h3 className="font-bold text-mmrgb-text mb-1">{opt.label}</h3>
                    <p className="text-sm text-mmrgb-textMuted">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-mmrgb-bg to-transparent">
        <Button onClick={handleNext} disabled={!isStepValid()} fullWidth size="lg" className="mx-auto max-w-md">
          {step === 2 ? "Get Started" : "Continue"} <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
`;

fs.writeFileSync("C:/Users/Lenovo/Downloads/Documents/hobbyvcode/mmrgb/src/screens/OnboardingScreen.tsx", onboarding);
console.log("OnboardingScreen.tsx written");
