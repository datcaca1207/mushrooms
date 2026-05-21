import { useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Camera,
  Cpu,
  LayoutDashboard,
  Menu,
  SlidersHorizontal,
} from 'lucide-react'
import { Sidebar } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import { MetricCard } from './components/MetricCard'
import { DeviceSwitch } from './components/DeviceSwitch'
import { ModeToggle } from './components/ModeToggle'
import { CameraMonitor } from './components/CameraMonitor'
import { AlertsPanel } from './components/AlertsPanel'
import { SensorChart } from './components/charts/SensorChart'
import { useMockFarmData } from './hooks/useMockFarmData'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const {
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
  } = useMockFarmData()

  const navItems = useMemo(
    () => [
      { label: 'Overview', icon: LayoutDashboard, active: true },
      { label: 'Control Panel', icon: SlidersHorizontal },
      { label: 'Camera AI', icon: Camera },
      { label: 'Analytics', icon: BarChart3 },
      { label: 'Alerts', icon: AlertTriangle },
    ],
    [],
  )

  const onlineDevices = Object.values(connectivity).filter(Boolean).length
  const totalDevices = Object.keys(connectivity).length

  return (
    <div className="min-h-screen w-full bg-cyber-grid text-zinc-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[1700px]">
        <Sidebar
          navItems={navItems}
          connectivity={connectivity}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="relative flex min-h-screen flex-1 flex-col overflow-hidden border-l border-zinc-800/80 bg-zinc-950/70 backdrop-blur-sm">
          <TopBar
            timestamp={timestamp}
            aiStatus={aiStatus}
            onlineDevices={onlineDevices}
            totalDevices={totalDevices}
          />

          <button
            type="button"
            className="absolute left-4 top-4 z-20 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-600/40 bg-zinc-950/70 text-cyan-300 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              <MetricCard
                label="Temperature"
                value={`${metrics.temperature.toFixed(1)}°C`}
                delta={metrics.temperature > 26 ? 'High' : 'Stable'}
                status={metrics.temperature > 26 ? 'warning' : 'ok'}
                icon={Activity}
              />
              <MetricCard
                label="Humidity"
                value={`${metrics.humidity.toFixed(1)}%`}
                delta={metrics.humidity < 75 ? 'Low' : 'Optimal'}
                status={metrics.humidity < 75 ? 'warning' : 'ok'}
                icon={Activity}
              />
              <MetricCard
                label="CO2"
                value={`${Math.round(metrics.co2)} ppm`}
                delta={metrics.co2 > 1050 ? 'Rising' : 'Normal'}
                status={metrics.co2 > 1050 ? 'danger' : 'ok'}
                icon={Cpu}
              />
              <MetricCard
                label="Water Level"
                value={`${metrics.waterLevel.toFixed(1)}%`}
                delta={metrics.waterLevel < 25 ? 'Refill Needed' : 'Sufficient'}
                status={metrics.waterLevel < 25 ? 'danger' : 'ok'}
                icon={Activity}
              />
              <MetricCard
                label="Device Network"
                value={`${onlineDevices}/${totalDevices}`}
                delta={onlineDevices === totalDevices ? 'Online' : 'Partial'}
                status={onlineDevices === totalDevices ? 'ok' : 'warning'}
                icon={Cpu}
              />
              <MetricCard
                label="AI Monitoring"
                value={aiStatus.toUpperCase()}
                delta={camera.diseaseRisk > 68 ? 'Potential Risk' : 'Tracking'}
                status={camera.diseaseRisk > 68 ? 'warning' : 'ok'}
                icon={Camera}
              />
            </section>

            <section className="mt-6 grid grid-cols-1 gap-6 2xl:grid-cols-12">
              <div className="space-y-6 2xl:col-span-8">
                <div className="panel-base">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold tracking-wide text-zinc-100">Device Control Panel</h2>
                      <p className="text-sm text-zinc-400">SCADA command interface for core actuators</p>
                    </div>
                    <ModeToggle modeAuto={modeAuto} onToggle={toggleMode} />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {Object.entries(devices).map(([key, value]) => (
                      <DeviceSwitch
                        key={key}
                        label={key}
                        enabled={value}
                        modeAuto={modeAuto}
                        onToggle={() => toggleDevice(key)}
                        online={Boolean(connectivity[key])}
                      />
                    ))}
                  </div>
                </div>

                <div className="panel-base">
                  <div className="mb-5 flex items-center justify-between gap-2">
                    <h2 className="text-lg font-semibold tracking-wide text-zinc-100">Realtime Sensor Streams</h2>
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> LIVE
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <SensorChart
                      title="Temperature"
                      unit="°C"
                      color="#22d3ee"
                      data={history.temperature}
                      dangerThreshold={27}
                    />
                    <SensorChart
                      title="Humidity"
                      unit="%"
                      color="#60a5fa"
                      data={history.humidity}
                      dangerThreshold={72}
                    />
                    <SensorChart
                      title="CO2"
                      unit="ppm"
                      color="#f59e0b"
                      data={history.co2}
                      dangerThreshold={1050}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6 2xl:col-span-4">
                <CameraMonitor camera={camera} aiStatus={aiStatus} />
                <AlertsPanel alerts={alerts} onAcknowledge={acknowledgeAlert} />
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
