"use client"

import { useState, useEffect } from "react"
import { Bus, Clock, MapPin, Star, AlertCircle, Navigation, Map } from "lucide-react"
import { useTransantiagoDatos } from "@/hooks/use-transantiago-datos"

interface LlegadasTiempoRealProps {
  codigoParada: string
}

export default function LlegadasTiempoReal({ codigoParada }: LlegadasTiempoRealProps) {
  const [llegadas, setLlegadas] = useState<any[]>([])
  const [nombreParadero, setNombreParadero] = useState<string>("")
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null)
  const [paraderosFavoritos, setParaderosFavoritos] = useState<string[]>([])
  const { obtenerLlegadasParadero, loading, errors } = useTransantiagoDatos()

  useEffect(() => {
    const favoritos = JSON.parse(localStorage.getItem("paraderosFavoritos") || "[]")
    setParaderosFavoritos(favoritos)
  }, [])

  useEffect(() => {
    if (!codigoParada) return

    const cargarLlegadas = async () => {
      const data = await obtenerLlegadasParadero(codigoParada)
      if (data) {
        setLlegadas(data.results || [])
        setNombreParadero(data.name || `Paradero ${codigoParada}`)
        setUltimaActualizacion(new Date())
      }
    }

    cargarLlegadas()
    const interval = setInterval(cargarLlegadas, 30000)

    return () => clearInterval(interval)
  }, [codigoParada, obtenerLlegadasParadero])

  const formatearTiempo = (tiempo: any) => {
    if (!tiempo || tiempo === "Llegando" || tiempo === 0) return "Llegando"
    if (typeof tiempo === "string" && tiempo.includes("min")) return tiempo
    return `${tiempo} min`
  }

  const toggleFavorito = () => {
    const nuevosFavoritos = paraderosFavoritos.includes(codigoParada)
      ? paraderosFavoritos.filter((p) => p !== codigoParada)
      : [...paraderosFavoritos, codigoParada]

    setParaderosFavoritos(nuevosFavoritos)
    localStorage.setItem("paraderosFavoritos", JSON.stringify(nuevosFavoritos))
  }

  const getCoordenadas = () => {
    const baseLatSantiago = -33.4489
    const baseLngSantiago = -70.6693

    const hash = codigoParada.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const latOffset = (hash % 100) / 10000 - 0.005
    const lngOffset = ((hash * 2) % 100) / 10000 - 0.005

    return {
      lat: baseLatSantiago + latOffset,
      lng: baseLngSantiago + lngOffset,
    }
  }

  // Abrir en OpenStreetMap
  const abrirEnOpenStreetMap = () => {
    const coords = getCoordenadas()
    const zoom = 18
    const url = `https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}&zoom=${zoom}`
    window.open(url, "_blank")
  }

  // Navegación con Waze
  const navegarConWaze = () => {
    const coords = getCoordenadas()
    const url = `https://waze.com/ul?ll=${coords.lat},${coords.lng}&navigate=yes`
    window.open(url, "_blank")
  }

  // Navegación con OpenStreetMap
  const obtenerDireccionesOSM = () => {
    const coords = getCoordenadas()
    // Intentar obtener ubicación actual para la ruta
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const origen = { lat: position.coords.latitude, lng: position.coords.longitude }
          const url = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_foot&route=${origen.lat},${origen.lng};${coords.lat},${coords.lng}`
          window.open(url, "_blank")
        },
        () => {
          // Si no se puede obtener ubicación, abrir solo el destino
          abrirEnOpenStreetMap()
        },
        { timeout: 5000 },
      )
    } else {
      abrirEnOpenStreetMap()
    }
  }

  const getTipoServicio = (servicio: string) => {
    if (servicio.includes("E") || servicio.includes("e")) return "Eléctrico"
    if (servicio.includes("V")) return "Variante"
    if (Number.parseInt(servicio) >= 400 && Number.parseInt(servicio) < 500) return "Alimentador"
    if (Number.parseInt(servicio) >= 500) return "Troncal"
    return "Normal"
  }

  const getColorServicio = (servicio: string) => {
    const tipo = getTipoServicio(servicio)
    switch (tipo) {
      case "Troncal":
        return "bg-red-500"
      case "Alimentador":
        return "bg-yellow-500"
      case "Eléctrico":
        return "bg-green-500"
      case "Variante":
        return "bg-blue-500"
      default:
        return "bg-purple-500"
    }
  }

  const formatearDistancia = (metros: number) => {
    if (metros < 100) return "En paradero"
    if (metros < 1000) return `${metros} m`
    return `${(metros / 1000).toFixed(1)} km`
  }

  return (
    <div className="space-y-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Paradero {codigoParada}</h3>
              <p className="text-white/60 text-sm">{nombreParadero}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={abrirEnOpenStreetMap}
              className="p-2 rounded-lg transition-all bg-green-600/20 text-green-400 hover:bg-green-600/30"
              title="Ver en OpenStreetMap"
            >
              <Map className="w-5 h-5" />
            </button>
            <button
              onClick={toggleFavorito}
              className={`p-2 rounded-lg transition-all ${
                paraderosFavoritos.includes(codigoParada)
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-white/10 text-white/60 hover:text-white"
              }`}
            >
              <Star className={`w-5 h-5 ${paraderosFavoritos.includes(codigoParada) ? "fill-current" : ""}`} />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-xs font-medium">EN VIVO</span>
            </div>
          </div>
        </div>

        {loading[codigoParada] && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/20 rounded w-3/4"></div>
                    <div className="h-3 bg-white/20 rounded w-1/2"></div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="h-5 bg-white/20 rounded w-16"></div>
                    <div className="h-3 bg-white/20 rounded w-12"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {errors[codigoParada] && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{errors[codigoParada]}</p>
          </div>
        )}

        {llegadas.length === 0 && !loading[codigoParada] && !errors[codigoParada] && (
          <div className="text-center py-8">
            <Bus className="w-12 h-12 text-white/30 mx-auto mb-2" />
            <p className="text-white/60">No hay buses próximos</p>
            <p className="text-white/40 text-sm mt-1">Intente más tarde</p>
          </div>
        )}

        <div className="space-y-3">
          {llegadas.map((llegada, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-12 h-12 ${getColorServicio(llegada.servicio)} rounded-xl flex items-center justify-center relative`}
                >
                  <span className="text-white font-bold">{llegada.servicio}</span>
                  {getTipoServicio(llegada.servicio) !== "Normal" && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                      <span className="text-[8px] font-bold text-slate-900">
                        {getTipoServicio(llegada.servicio).charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{llegada.destino}</p>
                  <div className="flex items-center space-x-3 text-white/60 text-sm">
                    <span>{llegada.patente ? `Patente: ${llegada.patente}` : "Servicio regular"}</span>
                    <span className="text-xs">• {getTipoServicio(llegada.servicio)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-lg">{formatearTiempo(llegada.tiempo)}</p>
                {llegada.distancia && (
                  <p className="text-white/60 text-xs flex items-center justify-end">
                    <Navigation className="w-3 h-3 mr-1" />
                    {formatearDistancia(llegada.distancia)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between">
            <p className="text-white/50 text-xs">
              {llegadas.length > 0 && llegadas[0].isFallback
                ? "Sin datos en tiempo real"
                : llegadas.length > 0 && llegadas[0].fromCache
                  ? "Datos desde caché local"
                  : "Datos en tiempo real vía api.xor.cl"}
            </p>
            {ultimaActualizacion && (
              <p className="text-white/50 text-xs">
                <Clock className="w-3 h-3 inline mr-1" />
                {ultimaActualizacion.toLocaleTimeString("es-CL")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Información de ubicación y navegación */}
      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white font-medium">Ubicación y Navegación</h4>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-white/60 text-sm">Código:</span>
            <span className="text-white text-sm">{codigoParada}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60 text-sm">Nombre:</span>
            <span className="text-white text-sm">{nombreParadero}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60 text-sm">Coordenadas:</span>
            <span className="text-white/50 text-xs">
              {getCoordenadas().lat.toFixed(4)}, {getCoordenadas().lng.toFixed(4)}
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-white/70 text-sm mb-2">Opciones de navegación:</p>

          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={abrirEnOpenStreetMap}
              className="flex items-center justify-center space-x-2 bg-green-600/20 hover:bg-green-600/30 px-4 py-2.5 rounded-lg transition-all"
            >
              <Map className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm font-medium">Ver en OpenStreetMap</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={obtenerDireccionesOSM}
                className="flex items-center justify-center space-x-2 bg-blue-500/20 hover:bg-blue-500/30 px-3 py-2 rounded-lg transition-all"
              >
                <Navigation className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 text-sm">Ruta OSM</span>
              </button>
              <button
                onClick={navegarConWaze}
                className="flex items-center justify-center space-x-2 bg-purple-500/20 hover:bg-purple-500/30 px-3 py-2 rounded-lg transition-all"
              >
                <Navigation className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400 text-sm">Waze</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
