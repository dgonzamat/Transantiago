"use client"

import { useState } from "react"
import { Clock, Filter, MapPin, RefreshCw } from "lucide-react"
import Header from "@/components/header"
import NavigationTabs from "@/components/navigation-tabs"
import EstadoMetroWidget from "@/components/estado-metro-widget"
import MapaMetro from "@/components/mapa-metro"
import { useTransantiagoDatos } from "@/hooks/use-transantiago-datos"

export default function MetroPage() {
  const [activeTab, setActiveTab] = useState("metro")
  const [vistaActiva, setVistaActiva] = useState<"lista" | "mapa">("lista")
  const [lineaSeleccionada, setLineaSeleccionada] = useState<string>("L1")
  const { obtenerEstadoMetro } = useTransantiagoDatos()

  const handleRefresh = () => {
    obtenerEstadoMetro()
  }

  const handleTabChange = (tab: string) => {
    if (tab === "dashboard") {
      window.location.href = "/"
    } else if (tab === "paraderos") {
      window.location.href = "/?tab=paraderos"
    } else if (tab === "tarjetas") {
      window.location.href = "/?tab=tarjetas"
    } else {
      setActiveTab(tab)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

      <div className="relative z-10">
        <Header />

        <main className="container mx-auto px-4 pb-20">
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-2xl">Red Metro de Santiago</h2>
              <div className="flex items-center space-x-2">
                <button onClick={handleRefresh} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all">
                  <RefreshCw className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => setVistaActiva(vistaActiva === "lista" ? "mapa" : "lista")}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                >
                  {vistaActiva === "lista" ? (
                    <MapPin className="w-5 h-5 text-white" />
                  ) : (
                    <Filter className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-white/60 text-sm mb-6">
              <Clock className="w-4 h-4" />
              <span>
                {new Date().toLocaleDateString("es-CL", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {vistaActiva === "lista" ? (
              <EstadoMetroWidget detallado />
            ) : (
              <MapaMetro
                lineaSeleccionada={lineaSeleccionada}
                onSeleccionarEstacion={(estacion) => console.log("Estación seleccionada:", estacion)}
              />
            )}
          </div>
        </main>

        <NavigationTabs activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </div>
  )
}
