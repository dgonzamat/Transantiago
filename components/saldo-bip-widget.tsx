"use client"

import { useState, useEffect } from "react"
import { CreditCard, Search, Loader, Star, Trash2 } from "lucide-react"
import { useTransantiagoDatos } from "@/hooks/use-transantiago-datos"

interface SaldoBipWidgetProps {
  gestionCompleta?: boolean
}

export default function SaldoBipWidget({ gestionCompleta = false }: SaldoBipWidgetProps) {
  const [numeroTarjeta, setNumeroTarjeta] = useState("")
  const [tarjetasGuardadas, setTarjetasGuardadas] = useState<
    Array<{ numero: string; alias: string; ultimoSaldo?: number }>
  >([])
  const [mostrarAgregarAlias, setMostrarAgregarAlias] = useState(false)
  const [nuevoAlias, setNuevoAlias] = useState("")
  const { saldoBip, loading, errors, consultarSaldoBip } = useTransantiagoDatos()

  useEffect(() => {
    const guardadas = JSON.parse(localStorage.getItem("tarjetasBip") || "[]")
    setTarjetasGuardadas(guardadas)
  }, [])

  const handleConsultar = async () => {
    if (numeroTarjeta.length >= 8) {
      await consultarSaldoBip(numeroTarjeta)
    }
  }

  const guardarTarjeta = () => {
    if (numeroTarjeta && nuevoAlias) {
      const nuevasTarjetas = [
        ...tarjetasGuardadas,
        {
          numero: numeroTarjeta,
          alias: nuevoAlias,
          ultimoSaldo: saldoBip?.balance,
        },
      ]
      setTarjetasGuardadas(nuevasTarjetas)
      localStorage.setItem("tarjetasBip", JSON.stringify(nuevasTarjetas))
      setMostrarAgregarAlias(false)
      setNuevoAlias("")
    }
  }

  const eliminarTarjeta = (numero: string) => {
    const nuevasTarjetas = tarjetasGuardadas.filter((t) => t.numero !== numero)
    setTarjetasGuardadas(nuevasTarjetas)
    localStorage.setItem("tarjetasBip", JSON.stringify(nuevasTarjetas))
  }

  // Modificar la función para mostrar indicador de datos de fallback
  const getSaldoColor = (saldo: number) => {
    if (saldo < 1000) return "text-red-400"
    if (saldo < 3000) return "text-yellow-400"
    return "text-green-400"
  }

  const getSaldoIndicator = (saldo: number) => {
    if (saldo < 1000) return { width: "20%", color: "bg-red-400" }
    if (saldo < 3000) return { width: "50%", color: "bg-yellow-400" }
    return { width: "80%", color: "bg-green-400" }
  }

  if (gestionCompleta) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4">
          {tarjetasGuardadas.map((tarjeta) => (
            <div key={tarjeta.numero} className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-white font-medium">{tarjeta.alias}</h4>
                  <p className="text-white/60 text-sm">**** {tarjeta.numero.slice(-4)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setNumeroTarjeta(tarjeta.numero)
                      consultarSaldoBip(tarjeta.numero)
                    }}
                    className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-all"
                  >
                    <Search className="w-4 h-4 text-blue-400" />
                  </button>
                  <button
                    onClick={() => eliminarTarjeta(tarjeta.numero)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
              {tarjeta.ultimoSaldo !== undefined && (
                <div className="flex items-baseline space-x-2">
                  <span className="text-white/70 text-sm">Último saldo:</span>
                  <span className={`font-bold ${getSaldoColor(tarjeta.ultimoSaldo)}`}>
                    ${tarjeta.ultimoSaldo.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-6">
          <h4 className="text-white font-medium mb-4">Agregar Nueva Tarjeta</h4>
          <SaldoBipWidget />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-md border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-lg">Mi Tarjeta Bip!</h3>
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <CreditCard className="w-4 h-4 text-white" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Número de tarjeta (ej: 87658765)"
            value={numeroTarjeta}
            onChange={(e) => setNumeroTarjeta(e.target.value.replace(/\D/g, ""))}
            className="flex-1 bg-white/10 backdrop-blur border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/60 focus:border-blue-400 focus:outline-none transition-all"
            maxLength={12}
          />
          <button
            onClick={handleConsultar}
            disabled={loading.saldoBip || numeroTarjeta.length < 8}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 rounded-lg px-6 py-3 text-white font-medium transition-all flex items-center space-x-2"
          >
            {loading.saldoBip ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span className="hidden sm:inline">{loading.saldoBip ? "Consultando..." : "Consultar"}</span>
          </button>
        </div>

        {errors.saldoBip && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-400 text-sm">
              {errors.saldoBip === "RedBip no contesta"
                ? "El sistema RedBip no está disponible en este momento. Por favor, intente más tarde."
                : errors.saldoBip}
            </p>
          </div>
        )}

        {saldoBip && (
          <div className="bg-white/5 backdrop-blur rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/70">Saldo Disponible</span>
              <span className="text-xs text-blue-400">
                {saldoBip.isFallback ? "Modo sin conexión" : saldoBip.fromCache ? "Desde caché" : "Actualizado ahora"}
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-white">$</span>
              <span className={`text-4xl font-bold ${getSaldoColor(saldoBip.balance || 0)}`}>
                {saldoBip.balance?.toLocaleString() || "N/A"}
              </span>
            </div>
            {saldoBip?.isFallback && (
              <div className="mt-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-2">
                <p className="text-yellow-400 text-xs text-center">
                  No se pudo obtener el saldo. Por favor, intente más tarde.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-white/60">
                <span>Nivel de saldo</span>
                <span>{saldoBip.balance < 1000 ? "Bajo" : saldoBip.balance < 3000 ? "Medio" : "Alto"}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${getSaldoIndicator(saldoBip.balance || 0).color}`}
                  style={{ width: getSaldoIndicator(saldoBip.balance || 0).width }}
                />
              </div>
            </div>

            {!tarjetasGuardadas.find((t) => t.numero === numeroTarjeta) && (
              <button
                onClick={() => setMostrarAgregarAlias(true)}
                className="w-full mt-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg py-2 text-white text-sm font-medium transition-all flex items-center justify-center space-x-2"
              >
                <Star className="w-4 h-4" />
                <span>Guardar Tarjeta</span>
              </button>
            )}

            <p className="text-white/50 text-xs text-center">
              Tarjeta: {saldoBip.numeroTarjeta} |
              {saldoBip.isFallback
                ? "Sin datos en tiempo real"
                : saldoBip.fromCache
                  ? "Datos desde caché local"
                  : "Datos vía api.xor.cl"}
            </p>
          </div>
        )}

        {mostrarAgregarAlias && (
          <div className="bg-white/5 backdrop-blur rounded-xl p-4 space-y-3 border border-blue-400/30">
            <h4 className="text-white font-medium">Guardar Tarjeta</h4>
            <input
              type="text"
              placeholder="Alias (ej: Mi tarjeta principal)"
              value={nuevoAlias}
              onChange={(e) => setNuevoAlias(e.target.value)}
              className="w-full bg-white/10 backdrop-blur border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/60 focus:border-blue-400 focus:outline-none transition-all"
            />
            <div className="flex space-x-2">
              <button
                onClick={guardarTarjeta}
                className="flex-1 bg-blue-500 hover:bg-blue-600 rounded-lg py-2 text-white font-medium transition-all"
              >
                Guardar
              </button>
              <button
                onClick={() => setMostrarAgregarAlias(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg py-2 text-white font-medium transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
