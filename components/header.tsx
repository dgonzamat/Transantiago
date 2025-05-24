"use client"

import { useEffect, useState } from "react"
import { Cloud, CloudRain, Sun, CloudSnow } from "lucide-react"

export default function Header() {
  const [fecha, setFecha] = useState(new Date())
  const [clima, setClima] = useState({ temp: 22, condition: "sunny" })

  useEffect(() => {
    const timer = setInterval(() => setFecha(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getSaludo = () => {
    const hora = fecha.getHours()
    if (hora < 12) return "Buenos días"
    if (hora < 19) return "Buenas tardes"
    return "Buenas noches"
  }

  const getWeatherIcon = () => {
    switch (clima.condition) {
      case "sunny":
        return <Sun className="w-5 h-5 text-yellow-400" />
      case "cloudy":
        return <Cloud className="w-5 h-5 text-gray-400" />
      case "rainy":
        return <CloudRain className="w-5 h-5 text-blue-400" />
      case "snowy":
        return <CloudSnow className="w-5 h-5 text-white" />
      default:
        return <Sun className="w-5 h-5 text-yellow-400" />
    }
  }

  return (
    <header className="bg-white/10 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{getSaludo()}</h1>
            <p className="text-white/70 text-sm">
              {fecha.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {getWeatherIcon()}
              <span className="text-white font-medium">{clima.temp}°C</span>
            </div>
            <div className="text-right">
              <p className="text-white font-bold text-xl">
                {fecha.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
              </p>
              <p className="text-white/70 text-xs">Santiago, Chile</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
