import React from "react"
import { clsx } from "clsx"

interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
  count?: number
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (id: string) => void
  className?: string
  variant?: "default" | "pills" | "underline"
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className, variant = "default" }) => {
  const variants = {
    default: "bg-mmrgb-surfaceElevated rounded-xl p-1",
    pills: "bg-transparent",
    underline: "bg-transparent border-b border-mmrgb-border"
  }

  const tabVariants = {
    default: "rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
    pills: "rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200",
    underline: "rounded-none px-4 py-3 text-sm font-medium border-b-2 border-transparent transition-all duration-200"
  }

  const activeVariants = {
    default: "bg-mmrgb-primary text-mmrgb-bg shadow-lg",
    pills: "bg-mmrgb-surfaceElevated text-mmrgb-primary border border-mmrgb-primary/30",
    underline: "text-mmrgb-primary border-mmrgb-primary"
  }

  const inactiveVariants = {
    default: "text-mmrgb-textMuted hover:text-mmrgb-text hover:bg-mmrgb-border/50",
    pills: "text-mmrgb-textMuted hover:text-mmrgb-text hover:bg-mmrgb-surfaceElevated",
    underline: "text-mmrgb-textMuted hover:text-mmrgb-text"
  }

  return (
    <div className={clsx(variants[variant], className)} role="tablist" aria-orientation="horizontal">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`${tab.id}-panel`}
          id={`${tab.id}-tab`}
          onClick={() => onChange(tab.id)}
          className={clsx(
            "flex items-center gap-2",
            tabVariants[variant],
            activeTab === tab.id ? activeVariants[variant] : inactiveVariants[variant]
          )}
        >
          {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
          {tab.label}
          {tab.count !== undefined && (
            <span className={clsx(
              "px-2 py-0.5 text-xs rounded-full",
              activeTab === tab.id ? "bg-mmrgb-bg text-mmrgb-primary" : "bg-mmrgb-border text-mmrgb-textMuted"
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}