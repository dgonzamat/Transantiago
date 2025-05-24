"use client"

import { useState, useCallback } from "react"

interface SaldoBip {
  balance?: number
  numeroTarjeta?: string
  consultadoEn?: string
  isFallback?: boolean
  fromCache?: boolean
}

interface EstadoMetro {
  ultimaActualizacion?: string
  [key: string]: any
  isFallback?: boolean
  fromCache?: boolean
}

interface LlegadasParadero {
  [key: string]: {
    results?: any[]
    ultimaActualizacion?: string
    isFallback?: boolean
    fromCache?: boolean
  }
}

interface LoadingState {
  saldoBip?: boolean
  metro?: boolean
  [key: string]: boolean | undefined
}

interface ErrorState {
  saldoBip?: string | null
  metro?: string | null
  [key: string]: string | null | undefined
}

// Interfaces para la respuesta de la API de Metro
interface MetroStation {
  name: string
  id: string
  status: number
  lines: string[]
  description: string
  is_closed_by_schedule: boolean
  schedule: {
    open: { weekdays: string; saturday: string; holidays: string }
    close: { weekdays: string; saturday: string; holidays: string }
  }
}

interface MetroLine {
  name: string
  id: string
  issues: boolean
  stations_closed_by_schedule: number
  stations: MetroStation[]
}

interface MetroApiResponse {
  api_status: string
  time: string
  issues: boolean
  lines: MetroLine[]
}

export const useTransantiagoDatos = () => {
  const [saldoBip, setSaldoBip] = useState<SaldoBip | null>(null)
  const [estadoMetro, setEstadoMetro] = useState<any[]>([])
  const [llegadasParadero, setLlegadasParadero] = useState<LlegadasParadero>({})
  const [loading, setLoading] = useState<LoadingState>({})
  const [errors, setErrors] = useState<ErrorState>({})

  // Consultar saldo Bip! con manejo de errores robusto
  const consultarSaldoBip = useCallback(async (numeroTarjeta: string) => {
    if (!/^\d{8,12}$/.test(numeroTarjeta)) {
      setErrors((prev) => ({ ...prev, saldoBip: "Número de tarjeta inválido" }))
      return null
    }

    setLoading((prev) => ({ ...prev, saldoBip: true }))
    setErrors((prev) => ({ ...prev, saldoBip: null }))

    try {
      // Intentar usar la API real
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 segundos de timeout

      const response = await fetch(`https://api.xor.cl/red/balance/${numeroTarjeta}`, {
        signal: controller.signal,
      }).catch((error) => {
        if (error.name === "AbortError") {
          throw new Error("La solicitud tomó demasiado tiempo")
        }
        throw error
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Error consultando saldo: ${response.status}`)
      }

      const data = await response.json()

      // Verificar si la respuesta contiene un error
      if (data.status_code && data.status_code !== 0) {
        // La API devolvió un error
        const errorMessage = data.status_description || `Error código ${data.status_code}`
        throw new Error(errorMessage)
      }

      const saldoData = {
        ...data,
        numeroTarjeta,
        consultadoEn: new Date().toISOString(),
      }

      setSaldoBip(saldoData)

      // Guardar en localStorage para consultas rápidas
      localStorage.setItem("ultimoSaldoBip", JSON.stringify({ numeroTarjeta, data: saldoData }))

      return saldoData
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      console.error("Error consultando saldo Bip:", errorMessage)
      setErrors((prev) => ({ ...prev, saldoBip: errorMessage }))

      // Intentar recuperar del caché
      const cached = localStorage.getItem("ultimoSaldoBip")
      if (cached) {
        try {
          const { numeroTarjeta: cachedNumero, data } = JSON.parse(cached)
          if (cachedNumero === numeroTarjeta) {
            setSaldoBip({ ...data, fromCache: true })
            return data
          }
        } catch (e) {
          console.error("Error al leer caché:", e)
        }
      }

      // Usar datos mínimos de fallback
      const fallbackData = {
        balance: 0,
        numeroTarjeta,
        consultadoEn: new Date().toISOString(),
        isFallback: true,
      }

      setSaldoBip(fallbackData)
      return fallbackData
    } finally {
      setLoading((prev) => ({ ...prev, saldoBip: false }))
    }
  }, [])

  // Modificar la función obtenerLlegadasParadero para procesar correctamente la estructura de la API
  const obtenerLlegadasParadero = useCallback(async (codigoParada: string) => {
    if (!/^PA\d{3,4}$/i.test(codigoParada)) {
      setErrors((prev) => ({ ...prev, [codigoParada]: "Código de parada inválido" }))
      return null
    }

    setLoading((prev) => ({ ...prev, [codigoParada]: true }))
    setErrors((prev) => ({ ...prev, [codigoParada]: null }))

    try {
      // Intentar usar la API real
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 segundos de timeout

      const response = await fetch(`https://api.xor.cl/red/bus-stop/${codigoParada.toUpperCase()}`, {
        signal: controller.signal,
      }).catch((error) => {
        if (error.name === "AbortError") {
          throw new Error("La solicitud tomó demasiado tiempo")
        }
        throw error
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Error obteniendo datos del paradero: ${response.status}`)
      }

      const data = await response.json()

      // Procesar los datos para adaptarlos al formato que espera nuestra aplicación
      const procesados = {
        id: data.id,
        name: data.name,
        status: data.status_code,
        results: procesarServiciosParadero(data.services),
        ultimaActualizacion: new Date().toISOString(),
      }

      setLlegadasParadero((prev) => ({
        ...prev,
        [codigoParada]: procesados,
      }))

      // Guardar en caché
      const cacheKey = `paradero_${codigoParada}`
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          data: procesados,
          timestamp: Date.now(),
        }),
      )

      return procesados
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      console.error("Error consultando paradero:", errorMessage)
      setErrors((prev) => ({ ...prev, [codigoParada]: errorMessage }))

      // Intentar recuperar del caché
      const cacheKey = `paradero_${codigoParada}`
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached)
          // Usar caché solo si tiene menos de 30 minutos
          if (Date.now() - timestamp < 30 * 60 * 1000) {
            setLlegadasParadero((prev) => ({
              ...prev,
              [codigoParada]: { ...data, fromCache: true },
            }))
            return data
          }
        } catch (e) {
          console.error("Error al leer caché:", e)
        }
      }

      // Usar datos mínimos de fallback
      const fallbackData = {
        id: codigoParada,
        name: "Sin datos disponibles",
        status: 0,
        results: [],
        ultimaActualizacion: new Date().toISOString(),
        isFallback: true,
      }

      setLlegadasParadero((prev) => ({
        ...prev,
        [codigoParada]: fallbackData,
      }))

      return fallbackData
    } finally {
      setLoading((prev) => ({ ...prev, [codigoParada]: false }))
    }
  }, [])

  // Añadir esta función para procesar los servicios del paradero
  const procesarServiciosParadero = (services: any[]) => {
    if (!Array.isArray(services)) {
      return []
    }

    // Aplanar la estructura para tener una lista de buses con su información de servicio
    const resultados: any[] = []

    services.forEach((servicio) => {
      if (servicio.valid && Array.isArray(servicio.buses) && servicio.buses.length > 0) {
        servicio.buses.forEach((bus: any) => {
          resultados.push({
            servicio: servicio.id,
            patente: bus.id,
            tiempo: bus.min_arrival_time === 0 ? "Llegando" : bus.min_arrival_time,
            tiempoMax: bus.max_arrival_time,
            distancia: bus.meters_distance,
            destino: obtenerDestinoServicio(servicio.id),
            estado: servicio.status_description,
          })
        })
      }
    })

    // Ordenar por tiempo de llegada
    return resultados.sort((a, b) => {
      if (a.tiempo === "Llegando") return -1
      if (b.tiempo === "Llegando") return 1
      return a.tiempo - b.tiempo
    })
  }

  // Función para obtener destinos basados en el ID del servicio
  const obtenerDestinoServicio = (idServicio: string) => {
    return `Ruta ${idServicio}`
  }

  // Consultar estado red metro con procesamiento inteligente y manejo mejorado de errores
  const obtenerEstadoMetro = useCallback(async () => {
    setLoading((prev) => ({ ...prev, metro: true }))
    setErrors((prev) => ({ ...prev, metro: null }))

    try {
      // Intentar recuperar del caché primero para mostrar algo rápidamente
      const cached = localStorage.getItem("estadoMetro")
      let cachedData = null

      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached)
          // Usar caché solo si tiene menos de 2 horas
          if (Date.now() - timestamp < 2 * 60 * 60 * 1000) {
            if (Array.isArray(data)) {
              Object.defineProperties(data, {
                fromCache: {
                  value: true,
                  enumerable: true,
                },
              })
              setEstadoMetro(data)
              cachedData = data
            }
          }
        } catch (e) {
          console.error("Error al leer caché:", e)
        }
      }

      // Intentar usar la API real
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 segundos de timeout

      try {
        // Eliminamos el modo no-cors que estaba causando problemas
        const response = await fetch("https://api.xor.cl/red/metro-network", {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        }).catch((error) => {
          if (error.name === "AbortError") {
            throw new Error("La solicitud tomó demasiado tiempo")
          }
          throw error
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`)
        }

        const data = await response.json()

        // Verificar la estructura de la respuesta
        if (!data || !data.lines || !Array.isArray(data.lines)) {
          throw new Error("Formato de datos inesperado")
        }

        // Procesar datos para agrupar por líneas
        const estadoProcesado = procesarEstadoMetroNuevo(data)

        // Añadir propiedades al array usando Object.defineProperties
        Object.defineProperties(estadoProcesado, {
          ultimaActualizacion: {
            value: new Date().toISOString(),
            enumerable: true,
          },
          isFallback: {
            value: false,
            enumerable: true,
          },
        })

        setEstadoMetro(estadoProcesado)

        // Guardar en caché
        localStorage.setItem(
          "estadoMetro",
          JSON.stringify({
            data: estadoProcesado,
            timestamp: Date.now(),
          }),
        )

        return estadoProcesado
      } catch (fetchError) {
        // Si tenemos datos en caché, los usamos y no mostramos error al usuario
        if (cachedData) {
          console.warn("Error al actualizar datos del metro, usando caché:", fetchError)
          return cachedData
        }

        // Si no hay caché, propagamos el error
        throw fetchError
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      console.error("Error consultando estado del metro:", errorMessage)

      // Mensaje más amigable para el usuario
      let userErrorMessage = errorMessage
      if (errorMessage.includes("Failed to fetch")) {
        userErrorMessage = "No se pudo conectar con el servidor. Verifique su conexión a internet."
      } else if (errorMessage.includes("Error HTTP")) {
        userErrorMessage = "El servidor no está disponible en este momento. Intente más tarde."
      }

      setErrors((prev) => ({ ...prev, metro: userErrorMessage }))

      // Usar datos de fallback si todo lo demás falla
      const fallbackData = generarDatosFallbackMetro()
      setEstadoMetro(fallbackData)
      return fallbackData
    } finally {
      setLoading((prev) => ({ ...prev, metro: false }))
    }
  }, [])

  // Función utilitaria para procesar estado del metro con la nueva estructura de la API
  const procesarEstadoMetroNuevo = (datosApi: MetroApiResponse) => {
    const coloresLineas: { [key: string]: string } = {
      L1: "#DC2626",
      L2: "#F59E0B",
      L3: "#845C40",
      L4: "#2563EB",
      L4A: "#2563EB",
      L5: "#059669",
      L6: "#5B21B6",
    }

    return datosApi.lines.map((linea) => {
      const estacionesProblema = linea.stations.filter((est) => est.status !== 0).map((est) => est.name)

      return {
        codigo: linea.id,
        nombre: linea.name,
        color: coloresLineas[linea.id] || "#6B7280", // Color por defecto si no está definido
        estadoGeneral: estacionesProblema.length === 0 ? 0 : 1,
        estacionesOperativas: linea.stations.filter((est) => est.status === 0).length,
        totalEstaciones: linea.stations.length,
        estacionesProblema,
        estaciones: linea.stations.map((est) => ({
          name: est.name,
          line: est.lines[0], // Tomamos la primera línea como principal
          status: est.status,
        })),
      }
    })
  }

  // Función utilitaria para procesar estado del metro (versión antigua, mantenida por compatibilidad)
  const procesarEstadoMetro = (datosRaw: any) => {
    // Asegurarse de que datosRaw sea un array
    if (!Array.isArray(datosRaw)) {
      console.error("procesarEstadoMetro recibió datos que no son un array:", datosRaw)
      datosRaw = [] // Si no es un array, usar un array vacío
    }

    const lineas = ["L1", "L2", "L3", "L4", "L4A", "L5", "L6"]
    const coloresLineas: { [key: string]: string } = {
      L1: "#DC2626",
      L2: "#F59E0B",
      L3: "#845C40",
      L4: "#2563EB",
      L4A: "#2563EB",
      L5: "#059669",
      L6: "#5B21B6",
    }

    return lineas.map((linea) => {
      const estacionesLinea = datosRaw.filter(
        (estacion: any) => estacion && (estacion.line === linea || estacion.linea === linea),
      )

      const estacionesProblema = estacionesLinea
        .filter((est: any) => est && est.status !== 0)
        .map((est: any) => est.name || est.nombre)

      return {
        codigo: linea,
        nombre: `Línea ${linea}`,
        color: coloresLineas[linea],
        estadoGeneral: estacionesProblema.length === 0 ? 0 : 1,
        estacionesOperativas: estacionesLinea.filter((est: any) => est && est.status === 0).length,
        totalEstaciones: estacionesLinea.length || 0,
        estacionesProblema,
        estaciones: estacionesLinea,
      }
    })
  }

  // Reemplazar la función generarDatosFallbackMetro con esta versión mejorada
  const generarDatosFallbackMetro = () => {
    // Datos de ejemplo más realistas para mostrar cuando no hay conexión
    const lineasInfo = [
      { id: "L1", nombre: "Línea 1", estaciones: 27, color: "#DC2626" },
      { id: "L2", nombre: "Línea 2", estaciones: 22, color: "#F59E0B" },
      { id: "L3", nombre: "Línea 3", estaciones: 18, color: "#845C40" },
      { id: "L4", nombre: "Línea 4", estaciones: 23, color: "#2563EB" },
      { id: "L4A", nombre: "Línea 4A", estaciones: 6, color: "#2563EB" },
      { id: "L5", nombre: "Línea 5", estaciones: 30, color: "#059669" },
      { id: "L6", nombre: "Línea 6", estaciones: 10, color: "#5B21B6" },
    ]

    const lineasProcesadas = lineasInfo.map((linea) => {
      // Crear algunas estaciones de ejemplo para cada línea
      const estacionesEjemplo = Array.from({ length: linea.estaciones }, (_, i) => ({
        name: `Estación ${i + 1}`,
        status: 0, // Todas operativas en el fallback
        lines: [linea.id],
      }))

      return {
        codigo: linea.id,
        nombre: linea.nombre,
        color: linea.color,
        estadoGeneral: 0,
        estacionesOperativas: linea.estaciones,
        totalEstaciones: linea.estaciones,
        estacionesProblema: [],
        estaciones: estacionesEjemplo,
      }
    })

    // Crear un objeto para almacenar las propiedades adicionales
    const resultado = [...lineasProcesadas]

    // Añadir propiedades al array
    Object.defineProperties(resultado, {
      ultimaActualizacion: {
        value: new Date().toISOString(),
        enumerable: true,
      },
      isFallback: {
        value: true,
        enumerable: true,
      },
    })

    return resultado
  }

  return {
    saldoBip,
    estadoMetro,
    llegadasParadero,
    loading,
    errors,
    consultarSaldoBip,
    obtenerLlegadasParadero,
    obtenerEstadoMetro,
  }
}
