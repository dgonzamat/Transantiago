"use client"

import { Home, MapPin, Train, CreditCard } from "lucide-react"

interface NavigationTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function NavigationTabs({ activeTab, onTabChange }: NavigationTabsProps) {
  const tabs = [
    { id: "dashboard", label: "Inicio", icon: Home },
    { id: "paraderos", label: "Paraderos", icon: MapPin },
    { id: "metro", label: "Metro", icon: Train },
    { id: "tarjetas", label: "Tarjetas", icon: CreditCard },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex justify-around">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 py-4 flex flex-col items-center space-y-1 transition-all ${
                activeTab === tab.id ? "text-blue-400" : "text-white/60 hover:text-white"
              }`}
            >
              <tab.icon className="w-6 h-6" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
