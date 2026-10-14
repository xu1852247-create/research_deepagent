export interface Point {
  x: number
  y: number
}

interface Props {
  points: Point[]
  xLabel: string
  yLabel: string
  xMax: number
  yMax: number
  /** 是否绘制过原点的拟合直线（用于“电流与电压成正比”） */
  proportionalLine?: boolean
}

const W = 340
const H = 230
const PAD = 44

/** 通用描点图表：坐标轴带名称与单位，数据点实时更新。 */
export default function PointChart({ points, xLabel, yLabel, xMax, yMax, proportionalLine }: Props) {
  const sx = (x: number) => PAD + (x / xMax) * (W - PAD - 18)
  const sy = (y: number) => H - PAD - (y / yMax) * (H - PAD - 18)

  let slope: number | null = null
  if (proportionalLine && points.length >= 2) {
    const sxy = points.reduce((s, p) => s + p.x * p.y, 0)
    const sxx = points.reduce((s, p) => s + p.x * p.x, 0)
    if (sxx > 0) slope = sxy / sxx
  }

  const xTicks = [0, xMax / 2, xMax]
  const yTicks = [0, yMax / 2, yMax]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md rounded-lg border bg-white" role="img">
      {/* 坐标轴 */}
      <line x1={PAD} y1={H - PAD} x2={W - 10} y2={H - PAD} stroke="#334155" strokeWidth={1.5} />
      <line x1={PAD} y1={H - PAD} x2={PAD} y2={12} stroke="#334155" strokeWidth={1.5} />
      {/* 轴名称与单位 */}
      <text x={W - 12} y={H - PAD - 8} textAnchor="end" fontSize={13} fill="#0f172a" fontWeight={600}>
        {xLabel}
      </text>
      <text x={PAD} y={10} textAnchor="middle" fontSize={13} fill="#0f172a" fontWeight={600}>
        {yLabel}
      </text>
      {/* 刻度 */}
      {xTicks.map((t) => (
        <g key={`x-${t}`}>
          <line x1={sx(t)} y1={H - PAD} x2={sx(t)} y2={H - PAD + 5} stroke="#334155" />
          <text x={sx(t)} y={H - PAD + 18} textAnchor="middle" fontSize={11} fill="#64748b">
            {t}
          </text>
        </g>
      ))}
      {yTicks.map((t) => (
        <g key={`y-${t}`}>
          <line x1={PAD - 5} y1={sy(t)} x2={PAD} y2={sy(t)} stroke="#334155" />
          <text x={PAD - 8} y={sy(t) + 4} textAnchor="end" fontSize={11} fill="#64748b">
            {t}
          </text>
        </g>
      ))}
      {/* 过原点拟合直线 */}
      {slope !== null && (
        <line
          x1={sx(0)}
          y1={sy(0)}
          x2={sx(xMax * 0.95)}
          y2={sy(Math.min(slope * xMax * 0.95, yMax * 0.98))}
          stroke="#f97316"
          strokeWidth={2}
        />
      )}
      {/* 数据点 */}
      {points.map((p, i) => (
        <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={4.5} fill="#2563eb" stroke="#fff" strokeWidth={1.5} />
      ))}
      {points.length === 0 && (
        <text x={W / 2} y={H / 2} textAnchor="middle" fontSize={13} fill="#94a3b8">
          点击「记录数据」后在此描点
        </text>
      )}
    </svg>
  )
}
