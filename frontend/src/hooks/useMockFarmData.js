import { useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'

const round = (num, digits = 1) => Number(num.toFixed(digits))
const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

function makePoint(value) {
  const now = new Date()
  return {
    time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    value,
  }
}

const initialDevices = {
  ledLight: false,
  mistSprinkler: false,
  ventilationFan: false,
  dehumidifier: false,
  waterPump: false,
}

const initialConnectivity = {
  ledLight: true,
  mistSprinkler: true,
  ventilationFan: true,
  dehumidifier: true,
  waterPump: true,
  camera: true,
  aiGateway: true,
}

export function useMockFarmData() {
  const [modeAuto, setModeAuto] = useState(true)
  const [metrics, setMetrics] = useState({ temperature: 24.6, humidity: 82.1, co2: 910, waterLevel: 74.6 })
  const [devices, setDevices] = useState(initialDevices)
  const [connectivity, setConnectivity] = useState(initialConnectivity)
  const [aiStatus, setAiStatus] = useState('active')
  const [camera, setCamera] = useState({
    lastDetection: 'No anomaly pattern',
    growthStage: 'Pinning phase',
    diseaseRisk: 21,
  })
  const [alerts, setAlerts] = useState([
    {
      id: crypto.randomUUID(),
      level: 'warning',
      message: 'Humidity trending below optimal threshold',
      source: 'Humidity Sensor B2',
      time: new Date().toLocaleTimeString(),
    },
  ])

  const [history, setHistory] = useState(() => {
    const temp = []
    const hum = []
    const co2 = []
    for (let i = 12; i >= 0; i -= 1) {
      temp.push(makePoint(round(24 + Math.random() * 2.4)))
      hum.push(makePoint(round(79 + Math.random() * 6)))
      co2.push(makePoint(round(880 + Math.random() * 130, 0)))
    }
    return { temperature: temp, humidity: hum, co2 }
  })

  const socket = useMemo(
    () =>
      io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:4010', {
        autoConnect: true,
        transports: ['websocket'],
      }),
    [],
  )

  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics((current) => {
        const nextTemperature = clamp(current.temperature + (Math.random() - 0.5) * 0.9, 21, 29.2)
        const nextHumidity = clamp(current.humidity + (Math.random() - 0.45) * 1.6, 68, 92)
        const nextCo2 = clamp(current.co2 + (Math.random() - 0.48) * 70, 700, 1300)
        const nextWater = clamp(current.waterLevel + (Math.random() - 0.62) * 1.8, 10, 98)

        const next = {
          temperature: round(nextTemperature),
          humidity: round(nextHumidity),
          co2: round(nextCo2, 0),
          waterLevel: round(nextWater),
        }

        setHistory((currentHistory) => ({
          temperature: [...currentHistory.temperature.slice(-19), makePoint(next.temperature)],
          humidity: [...currentHistory.humidity.slice(-19), makePoint(next.humidity)],
          co2: [...currentHistory.co2.slice(-19), makePoint(next.co2)],
        }))

        const riskBump =
          nextHumidity < 74 || nextCo2 > 1080 || nextTemperature > 27.2 ? Math.random() * 8 : -Math.random() * 5

        setCamera((cam) => ({
          ...cam,
          diseaseRisk: clamp(round(cam.diseaseRisk + riskBump, 0), 5, 98),
          growthStage:
            nextTemperature > 26.5
              ? 'Rapid colonization'
              : nextHumidity > 84
                ? 'Fruiting setup'
                : 'Pinning phase',
          lastDetection: nextCo2 > 1060 ? 'Ventilation lag detected' : 'No anomaly pattern',
        }))

        setAiStatus(nextCo2 > 1080 || nextHumidity < 72 ? 'warning' : 'active')

        return next
      })

      setConnectivity((current) => {
        const updated = { ...current }
        Object.keys(updated).forEach((key) => {
          updated[key] = Math.random() > 0.03
        })
        return updated
      })

      setAlerts((current) => {
        const now = new Date().toLocaleTimeString()
        const next = [...current]

        if (metrics.co2 > 1080 && Math.random() > 0.65) {
          next.unshift({
            id: crypto.randomUUID(),
            level: 'danger',
            message: 'CO2 concentration exceeded safety envelope',
            source: 'Atmosphere Node A1',
            time: now,
          })
        } else if (metrics.waterLevel < 26 && Math.random() > 0.72) {
          next.unshift({
            id: crypto.randomUUID(),
            level: 'warning',
            message: 'Reservoir level is critically low',
            source: 'Water Tank Sensor',
            time: now,
          })
        } else if (Object.values(connectivity).some((status) => !status) && Math.random() > 0.8) {
          next.unshift({
            id: crypto.randomUUID(),
            level: 'warning',
            message: 'Intermittent device heartbeat failure',
            source: 'Fieldbus Monitor',
            time: now,
          })
        }

        return next.slice(0, 7)
      })
    }, 1800)

    return () => clearInterval(timer)
  }, [connectivity, metrics.co2, metrics.waterLevel])

  useEffect(() => {
    const handleConnect = () => setAiStatus('active')
    const handleDisconnect = () => setAiStatus('warning')

    const handleSensorUpdate = (event) => {
      if (!event || typeof event.metric !== 'string') return

      const metricKey = event.metric.toLowerCase()
      const value = Number(event.value)
      if (Number.isNaN(value)) return

      setMetrics((current) => {
        const next = { ...current }

        if (metricKey.includes('temperature')) {
          next.temperature = round(value)
        } else if (metricKey.includes('humidity')) {
          next.humidity = round(value)
        } else if (metricKey === 'co2ppm' || metricKey.includes('co2')) {
          next.co2 = round(value, 0)
        } else if (metricKey.includes('water')) {
          next.waterLevel = round(value)
        }

        return next
      })

      setHistory((currentHistory) => {
        const point = makePoint(value)
        if (metricKey.includes('temperature')) {
          return {
            ...currentHistory,
            temperature: [...currentHistory.temperature.slice(-19), point],
          }
        }
        if (metricKey.includes('humidity')) {
          return {
            ...currentHistory,
            humidity: [...currentHistory.humidity.slice(-19), point],
          }
        }
        if (metricKey === 'co2ppm' || metricKey.includes('co2')) {
          return {
            ...currentHistory,
            co2: [...currentHistory.co2.slice(-19), point],
          }
        }
        return currentHistory
      })
    }

    const handleDeviceUpdate = (event) => {
      if (!event || typeof event.key !== 'string') return

      setConnectivity((current) => {
        const updated = { ...current }
        if (event.key.toLowerCase().includes('camera')) {
          updated.camera = true
          return updated
        }

        const map = {
          led: 'ledLight',
          sprinkler: 'mistSprinkler',
          fan: 'ventilationFan',
          dehumidifier: 'dehumidifier',
          waterpump: 'waterPump',
          pump: 'waterPump',
        }

        const mapped = map[event.key.toLowerCase()] || map[event.key.replace(/[^a-z]/gi, '').toLowerCase()]
        if (mapped) updated[mapped] = true
        return updated
      })

      setDevices((current) => {
        const map = {
          led: 'ledLight',
          sprinkler: 'mistSprinkler',
          fan: 'ventilationFan',
          dehumidifier: 'dehumidifier',
          waterpump: 'waterPump',
          pump: 'waterPump',
        }
        const normalized = event.key.replace(/[^a-z]/gi, '').toLowerCase()
        const key = map[event.key.toLowerCase()] || map[normalized]
        if (!key) return current
        return {
          ...current,
          [key]: String(event.status || '').toUpperCase() === 'ON',
        }
      })
    }

    const handleAiUpdate = (event) => {
      const payload = event?.payload || {}
      if (payload.message || payload.level) {
        setAlerts((current) => [
          {
            id: crypto.randomUUID(),
            level: String(payload.level || 'warning').toLowerCase().includes('danger') ? 'danger' : 'warning',
            message: payload.message || 'AI anomaly detected',
            source: 'AI Camera Service',
            time: new Date().toLocaleTimeString(),
          },
          ...current,
        ].slice(0, 7))
      }

      setCamera((cam) => ({
        ...cam,
        lastDetection: payload.message || cam.lastDetection,
        diseaseRisk: typeof payload?.metadata?.riskPct === 'number' ? payload.metadata.riskPct : cam.diseaseRisk,
      }))
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('sensor:update', handleSensorUpdate)
    socket.on('device:update', handleDeviceUpdate)
    socket.on('ai:update', handleAiUpdate)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('sensor:update', handleSensorUpdate)
      socket.off('device:update', handleDeviceUpdate)
      socket.off('ai:update', handleAiUpdate)
      socket.disconnect()
    }
  }, [socket])

  const toggleMode = () => {
    setModeAuto((current) => !current)
  }

  const toggleDevice = (deviceKey) => {
    if (modeAuto) return
    setDevices((current) => {
      const next = { ...current, [deviceKey]: !current[deviceKey] }
      const keyMap = {
        ledLight: 'led',
        mistSprinkler: 'sprinkler',
        ventilationFan: 'fan',
        dehumidifier: 'dehumidifier',
        waterPump: 'waterpump',
      }
      socket.emit('device:control', {
        deviceKey: keyMap[deviceKey] || deviceKey,
        command: next[deviceKey] ? 'ON' : 'OFF',
      })
      return next
    })
  }

  const acknowledgeAlert = (id) => {
    setAlerts((current) => current.filter((item) => item.id !== id))
  }

  const timestamp = new Date().toLocaleString()

  return {
    timestamp,
    modeAuto,
    aiStatus,
    metrics,
    history,
    devices,
    connectivity,
    alerts,
    camera,
    toggleMode,
    toggleDevice,
    acknowledgeAlert,
  }
}
