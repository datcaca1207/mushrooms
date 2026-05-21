import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export function SensorChart({ title, unit, color, data, dangerThreshold }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
      <h3 className="mb-3 text-sm font-medium text-zinc-200">{title}</h3>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 6, left: -18, bottom: 2 }}>
            <defs>
              <linearGradient id={`fill-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="time" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
            <Tooltip
              contentStyle={{
                background: '#09090b',
                border: '1px solid #3f3f46',
                borderRadius: 10,
                color: '#e4e4e7',
              }}
              formatter={(value) => `${value} ${unit}`}
            />
            <ReferenceLine
              y={dangerThreshold}
              stroke="#f87171"
              strokeDasharray="4 3"
              ifOverflow="extendDomain"
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              fillOpacity={1}
              fill={`url(#fill-${title})`}
              strokeWidth={2}
              isAnimationActive
              animationDuration={500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
