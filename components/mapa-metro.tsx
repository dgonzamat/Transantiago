"use client"

import { useState, useEffect } from "react"
import { useTransantiagoDatos } from "@/hooks/use-transantiago-datos"
import { AlertCircle, Clock, Info, Loader } from "lucide-react"

interface MapaMetroProps {
  lineaSeleccionada?: string
  onSeleccionarEstacion?: (estacion: any) => void
}

export default function MapaMetro({ lineaSeleccionada, onSeleccionarEstacion }: MapaMetroProps) {
  const [lineas, setLineas] = useState<any[]>([])
  const [lineaActiva, setLineaActiva] = useState<string>(lineaSeleccionada || "L1")
  const [estacionSeleccionada, setEstacionSeleccionada] = useState<any>(null)
  const { estadoMetro, obtenerEstadoMetro, loading, errors } = useTransantiagoDatos()

  useEffect(() => {
    if (lineaSeleccionada) {
      setLineaActiva(lineaSeleccionada)
    }
  }, [lineaSeleccionada])

  useEffect(() => {
    if (!estadoMetro || estadoMetro.length === 0) {
      obtenerEstadoMetro()
    } else {
      setLineas(estadoMetro)
    }
  }, [estadoMetro, obtenerEstadoMetro])

  const handleSeleccionarEstacion = (estacion: any) => {
    setEstacionSeleccionada(estacion)
    if (onSeleccionarEstacion) {
      onSeleccionarEstacion(estacion)
    }
  }

  const getEstadoColor = (estado: number) => {
    switch (estado) {
      case 0:
        return "bg-green-500"
      case 1:
        return "bg-yellow-500"
      case 2:
        return "bg-red-500"
      case 3:
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  const getEstadoTexto = (estado: number) => {
    switch (estado) {
      case 0:
        return "Operativa"
      case 1:
        return "Cerrada Temporalmente"
      case 2:
        return "No Habilitada"
      case 3:
        return "Accesos Cerrados"
      default:
        return "Desconocido"
    }
  }

  const getEstacionesLinea = () => {
    const linea = lineas.find((l) => l.codigo === lineaActiva)
    return linea?.estaciones || []
  }

  const renderizarLinea = () => {
    const estaciones = getEstacionesLinea()
    const linea = lineas.find((l) => l.codigo === lineaActiva)

    if (!linea) return null

    return (
      <div className="mt-4">
        <div className="relative py-6">
          {/* Línea de metro */}
          <div
            className="absolute h-3 top-1/2 left-0 right-0 transform -translate-y-1/2 rounded-full"
            style={{ backgroundColor: linea.color }}
          ></div>

          {/* Estaciones */}
          <div className="flex justify-between relative z-10">
            {estaciones.map((estacion: any, index: number) => (
              <div
                key={estacion.name}
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => handleSeleccionarEstacion(estacion)}
              >
                <div
                  className={`w-6 h-6 rounded-full border-2 border-white ${getEstadoColor(estacion.status)} mb-2 group-hover:scale-125 transition-all`}
                ></div>
                <div className="absolute top-10 transform -rotate-45 origin-top-left">
                  <span className="text-xs text-white whitespace-nowrap">{estacion.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6">
      <h3 className="text-white font-semibold text-lg mb-4">Mapa de Red Metro</h3>

      {loading.metro && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-blue-400 animate-spin" />
          <span className="ml-3 text-white">Cargando estado de la red...</span>
        </div>
      )}

      {errors.metro && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-2" />
            <p className="text-red-400">{errors.metro}</p>
          </div>
        </div>
      )}

      {!loading.metro && lineas.length > 0 && (
        <>
          <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
            {lineas.map((linea) => (
              <button
                key={linea.codigo}
                onClick={() => setLineaActiva(linea.codigo)}
                className={`px-3 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                  lineaActiva === linea.codigo ? "text-white" : "text-white/60 hover:text-white/80"
                }`}
                style={{
                  backgroundColor: lineaActiva === linea.codigo ? linea.color : "rgba(255,255,255,0.1)",
                }}
              >
                <span>{linea.nombre}</span>
                {linea.estadoGeneral !== 0 && <AlertCircle className="w-4 h-4" />}
              </button>
            ))}
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-medium">Estado de la Línea</h4>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-white/60" />
                <span className="text-white/60 text-xs">
                  {estadoMetro.ultimaActualizacion
                    ? new Date(estadoMetro.ultimaActualizacion).toLocaleTimeString("es-CL")
                    : "Sin datos"}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-white/80 text-sm">Operativa</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-white/80 text-sm">Cerrada Temp.</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-white/80 text-sm">No Habilitada</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto pb-4">{renderizarLinea()}</div>

          {estacionSeleccionada && (
            <div className="mt-6 bg-white/5 rounded-xl p-4 border border-white/10">
              <h4 className="text-white font-medium mb-2">{estacionSeleccionada.name}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/60 text-sm mb-1">Estado:</p>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getEstadoColor(estacionSeleccionada.status)}`}></div>
                    <span className="text-white">{getEstadoTexto(estacionSeleccionada.status)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Conexiones:</p>
                  <div className="flex items-center space-x-2">
                    {estacionSeleccionada.lines &&
                      estacionSeleccionada.lines.map((lineaId: string) => {
                        const linea = lineas.find((l) => l.codigo === lineaId)
                        return (
                          <div
                            key={lineaId}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: linea?.color || "#6B7280" }}
                          >
                            {lineaId.replace("L", "")}
                          </div>
                        )
                      })}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between">
              <p className="text-white/50 text-xs">
                {estadoMetro.isFallback
                  ? "Datos simulados (sin conexión)"
                  : estadoMetro.fromCache
                    ? "Datos desde caché local"
                    : "Datos vía api.xor.cl"}
              </p>
              <div className="flex items-center space-x-1">
                <Info className="w-3 h-3 text-white/50" />
                <p className="text-white/50 text-xs">Toque una estación para ver detalles</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
