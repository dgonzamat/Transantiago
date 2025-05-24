"use client"

import { useState } from "react"
import { Bus, Train, MapPin, Clock } from "lucide-react"
import SaldoBipWidget from "@/components/saldo-bip-widget"
import LlegadasTiempoReal from "@/components/llegadas-tiempo-real"
import EstadoMetroWidget from "@/components/estado-metro-widget"
import NavigationTabs from "@/components/navigation-tabs"
import Header from "@/components/header"

export default function TransantiagoApp() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [codigoParadaActual, setCodigoParadaActual] = useState("")

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

      <div className="relative z-10">
        <Header />

        <main className="container mx-auto px-4 pb-20">
          {activeTab === "dashboard" && (
            <div className="space-y-6 mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <SaldoBipWidget />
                <EstadoMetroWidget />
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-semibold text-lg mb-4">Consulta de Paradero</h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Código de parada (ej: PA433)"
                    value={codigoParadaActual}
                    onChange={(e) => setCodigoParadaActual(e.target.value.toUpperCase())}
                    className="flex-1 bg-white/10 backdrop-blur border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/60 focus:border-blue-400 focus:outline-none transition-all"
                  />
                  <button
                    onClick={() => setActiveTab("paraderos")}
                    disabled={!/^PA\d{3,4}$/i.test(codigoParadaActual)}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 rounded-lg px-6 py-3 text-white font-medium transition-all"
                  >
                    Consultar
                  </button>
                </div>
                <p className="text-white/50 text-sm mt-2">
                  Ingresa el código del paradero para ver las llegadas en tiempo real
                </p>
              </div>

              <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                {[
                  { icon: MapPin, label: "Paraderos Activos", count: "2.847" },
                  { icon: Bus, label: "Buses en Ruta", count: "6.234" },
                  { icon: Train, label: "Estaciones Metro", count: "136" },
                  { icon: Clock, label: "Tiempo Promedio", count: "12 min" },
                ].map((stat, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon className="w-5 h-5 text-blue-400" />
                      <span className="text-2xl font-bold text-white">{stat.count}</span>
                    </div>
                    <p className="text-white/70 text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "paraderos" && (
            <div className="mt-6">
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-6">
                <h2 className="text-white font-bold text-xl mb-4">Consulta de Paraderos</h2>
                <div className="flex space-x-2 mb-6">
                  <input
                    type="text"
                    placeholder="Código de parada (ej: PA433)"
                    value={codigoParadaActual}
                    onChange={(e) => setCodigoParadaActual(e.target.value.toUpperCase())}
                    className="flex-1 bg-white/10 backdrop-blur border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/60 focus:border-blue-400 focus:outline-none transition-all"
                  />
                  <button
                    onClick={() => {
                      /* Aquí se podría agregar funcionalidad adicional */
                    }}
                    className="bg-blue-500 hover:bg-blue-600 rounded-lg px-6 py-3 text-white font-medium transition-all flex items-center space-x-2"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Consultar</span>
                  </button>
                </div>

                {/^PA\d{3,4}$/i.test(codigoParadaActual) && <LlegadasTiempoReal codigoParada={codigoParadaActual} />}

                {!codigoParadaActual && (
                  <div className="text-center py-12">
                    <MapPin className="w-16 h-16 text-white/30 mx-auto mb-4" />
                    <h3 className="text-white font-medium text-lg mb-2">Consulta Información de Paraderos</h3>
                    <p className="text-white/60 mb-4">
                      Ingresa el código de un paradero para ver las llegadas de buses en tiempo real
                    </p>
                    <div className="bg-white/5 rounded-lg p-4 max-w-md mx-auto">
                      <h4 className="text-white/80 font-medium mb-2">Ejemplos de códigos:</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-blue-500/20 rounded px-3 py-1 text-blue-400">PA433</div>
                        <div className="bg-blue-500/20 rounded px-3 py-1 text-blue-400">PA1205</div>
                        <div className="bg-blue-500/20 rounded px-3 py-1 text-blue-400">PA567</div>
                        <div className="bg-blue-500/20 rounded px-3 py-1 text-blue-400">PA890</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "metro" && (
            <div className="mt-6">
              <EstadoMetroWidget detallado />
            </div>
          )}

          {activeTab === "tarjetas" && (
            <div className="mt-6">
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <h2 className="text-white font-bold text-xl mb-6">Mis Tarjetas Bip!</h2>
                <SaldoBipWidget gestionCompleta />
              </div>
            </div>
          )}
        </main>

        <NavigationTabs activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </div>
  )
}
