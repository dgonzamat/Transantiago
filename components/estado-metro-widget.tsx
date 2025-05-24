"use client"

import { useState, useEffect } from "react"
import { Train, AlertCircle, CheckCircle, XCircle, ChevronDown, ChevronUp, RefreshCw } from "lucide-react"
import { useTransantiagoDatos } from "@/hooks/use-transantiago-datos"

interface EstadoMetroWidgetProps {
  detallado?: boolean
}

export default function EstadoMetroWidget({ detallado = false }: EstadoMetroWidgetProps) {
  const [lineasExpandidas, setLineasExpandidas] = useState<string[]>([])
  const [filtro, setFiltro] = useState<"todas" | "problemas">("todas")
  const { estadoMetro, loading, errors, obtenerEstadoMetro } = useTransantiagoDatos()

  useEffect(() => {
    obtenerEstadoMetro()
    const interval = setInterval(obtenerEstadoMetro, 120000) // Actualizar cada 2 minutos
    return () => clearInterval(interval)
  }, [obtenerEstadoMetro])

  const toggleLinea = (linea: string) => {
    setLineasExpandidas((prev) => (prev.includes(linea) ? prev.filter((l) => l !== linea) : [...prev, linea]))
  }

  const getEstadoIcon = (estado: number) => {
    switch (estado) {
      case 0:
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 1:
        return <AlertCircle className="w-4 h-4 text-yellow-400" />
      case 2:
        return <XCircle className="w-4 h-4 text-red-400" />
      case 3:
        return <AlertCircle className="w-4 h-4 text-orange-400" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />
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

  const getEstadoColor = (estado: number) => {
    switch (estado) {
      case 0:
        return "text-green-400"
      case 1:
        return "text-yellow-400"
      case 2:
        return "text-red-400"
      case 3:
        return "text-orange-400"
      default:
        return "text-gray-400"
    }
  }

  if (!detallado) {
    return (
      <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-md border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-lg">Estado Red Metro</h3>
          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
            <Train className="w-4 h-4 text-white" />
          </div>
        </div>

        {loading.metro && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-white/20 rounded-lg"></div>
              </div>
            ))}
          </div>
        )}

        {errors.metro && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{errors.metro}</p>
          </div>
        )}

        {estadoMetro && estadoMetro.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {estadoMetro.slice(0, 6).map((linea: any) => (
              <div
                key={linea.codigo}
                className="bg-white/5 backdrop-blur rounded-lg p-3 hover:bg-white/10 transition-all cursor-pointer"
                onClick={() => (window.location.href = "#metro")}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-bold text-sm" style={{ color: linea.color }}>
                    {linea.codigo}
                  </span>
                  {getEstadoIcon(linea.estadoGeneral)}
                </div>
                <p className="text-white/60 text-xs">
                  {linea.estacionesOperativas}/{linea.totalEstaciones}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-white/10">
          <p className="text-white/50 text-xs text-center">
            {estadoMetro && "isFallback" in estadoMetro && estadoMetro.isFallback
              ? "Sin datos en tiempo real"
              : estadoMetro && "fromCache" in estadoMetro && estadoMetro.fromCache
                ? "Datos desde caché local"
                : "Estado vía api.xor.cl"}{" "}
            | Actualizado cada 2 minutos
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-bold text-xl">Estado Completo Red Metro</h2>
        <button
          onClick={() => obtenerEstadoMetro()}
          disabled={loading.metro}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 text-white ${loading.metro ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setFiltro("todas")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filtro === "todas" ? "bg-blue-500 text-white" : "bg-white/10 text-white/70 hover:bg-white/20"
          }`}
        >
          Todas las Líneas
        </button>
        <button
          onClick={() => setFiltro("problemas")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filtro === "problemas" ? "bg-red-500 text-white" : "bg-white/10 text-white/70 hover:bg-white/20"
          }`}
        >
          Solo Problemas
        </button>
      </div>

      {loading.metro && !estadoMetro.length && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-white/20 rounded-lg"></div>
            </div>
          ))}
        </div>
      )}

      {errors.metro && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="text-red-400 text-sm">{errors.metro}</p>
              <p className="text-red-400/70 text-xs mt-1">
                Estamos mostrando información guardada anteriormente. Intente actualizar más tarde.
              </p>
            </div>
          </div>
        </div>
      )}

      {!loading.metro && (!estadoMetro || estadoMetro.length === 0) && (
        <div className="text-center py-8">
          <Train className="w-12 h-12 text-white/30 mx-auto mb-2" />
          <p className="text-white/60">No hay datos disponibles</p>
          <p className="text-white/40 text-sm mt-1">Intente más tarde</p>
        </div>
      )}

      {estadoMetro && estadoMetro.length > 0 && (
        <div className="space-y-3">
          {estadoMetro
            .filter(
              (linea: any) => filtro === "todas" || (linea.estacionesProblema && linea.estacionesProblema.length > 0),
            )
            .map((linea: any) => (
              <div key={linea.codigo} className="bg-white/5 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleLinea(linea.codigo)}
                  className="w-full p-4 flex items-center justify-between hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white"
                      style={{ backgroundColor: linea.color }}
                    >
                      {linea.codigo}
                    </div>
                    <div className="text-left">
                      <h3 className="text-white font-semibold">{linea.nombre}</h3>
                      <p className="text-white/60 text-sm">
                        {linea.estacionesOperativas} de {linea.totalEstaciones} estaciones operativas
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getEstadoIcon(linea.estadoGeneral)}
                    {lineasExpandidas.includes(linea.codigo) ? (
                      <ChevronUp className="w-5 h-5 text-white/60" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-white/60" />
                    )}
                  </div>
                </button>

                {lineasExpandidas.includes(linea.codigo) && linea.estaciones && linea.estaciones.length > 0 && (
                  <div className="px-4 pb-4 border-t border-white/10">
                    <div className="mt-4 space-y-2">
                      {linea.estaciones
                        .filter((est: any) => est && (filtro === "todas" || est.status !== 0))
                        .map((estacion: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg"
                          >
                            <span className="text-white text-sm">{estacion.name || estacion.nombre}</span>
                            <div className="flex items-center space-x-2">
                              {getEstadoIcon(estacion.status)}
                              <span className={`text-xs ${getEstadoColor(estacion.status)}`}>
                                {getEstadoTexto(estacion.status)}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {lineasExpandidas.includes(linea.codigo) && (!linea.estaciones || linea.estaciones.length === 0) && (
                  <div className="px-4 pb-4 border-t border-white/10">
                    <div className="mt-4 text-center py-4">
                      <p className="text-white/60">No hay información detallada disponible</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      {estadoMetro && estadoMetro.length > 0 && "ultimaActualizacion" in estadoMetro && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-white/50 text-xs text-center">
            {"isFallback" in estadoMetro && estadoMetro.isFallback
              ? "Sin datos en tiempo real"
              : "fromCache" in estadoMetro && estadoMetro.fromCache
                ? "Datos desde caché local"
                : "Estado vía api.xor.cl"}{" "}
            | Última actualización: {new Date(estadoMetro.ultimaActualizacion).toLocaleTimeString("es-CL")}
          </p>
        </div>
      )}
      {estadoMetro && estadoMetro.isFallback && (
        <div className="mt-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
          <p className="text-yellow-400 text-sm text-center">
            No se pudieron obtener datos en tiempo real. Intente más tarde.
          </p>
        </div>
      )}
    </div>
  )
}
