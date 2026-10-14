import { SOURCE_VOLTAGE_V } from '@/physics/ohm'

interface Props {
  fixedOhm: number
  sliderPercent: number
  currentA: number
  resistorVoltV: number
}

/**
 * 串联实验电路图（SVG 自绘）：
 * 电源 — 开关 — 电流表 — 定值电阻 — 滑动变阻器 串联，电压表并在定值电阻两端。
 * 滑变箭头位置与滑块百分比联动。
 */
export default function CircuitDiagram({ fixedOhm, sliderPercent, currentA, resistorVoltV }: Props) {
  const wire = '#1e293b'
  const arrowX = 300 + (sliderPercent / 100) * 120

  return (
    <svg viewBox="0 0 640 380" className="w-full rounded-lg border bg-white" role="img" aria-label="串联实验电路图">
      {/* 顶部导线 */}
      <line x1={70} y1={90} x2={150} y2={90} stroke={wire} strokeWidth={2.5} />
      <line x1={195} y1={90} x2={270} y2={90} stroke={wire} strokeWidth={2.5} />
      <line x1={310} y1={90} x2={400} y2={90} stroke={wire} strokeWidth={2.5} />
      <line x1={465} y1={90} x2={570} y2={90} stroke={wire} strokeWidth={2.5} />
      {/* 右侧导线 */}
      <line x1={570} y1={90} x2={570} y2={310} stroke={wire} strokeWidth={2.5} />
      {/* 底部导线 */}
      <line x1={570} y1={310} x2={470} y2={310} stroke={wire} strokeWidth={2.5} />
      <line x1={300} y1={310} x2={70} y2={310} stroke={wire} strokeWidth={2.5} />
      {/* 左侧导线（电池断开处上下两段） */}
      <line x1={70} y1={90} x2={70} y2={188} stroke={wire} strokeWidth={2.5} />
      <line x1={70} y1={212} x2={70} y2={310} stroke={wire} strokeWidth={2.5} />

      {/* 电源（长正短负） */}
      <line x1={48} y1={188} x2={92} y2={188} stroke={wire} strokeWidth={2} />
      <line x1={58} y1={212} x2={82} y2={212} stroke={wire} strokeWidth={6} />
      <text x={100} y={192} fontSize={14} fill={wire}>+</text>
      <text x={16} y={240} fontSize={13} fill={wire}>电源 {SOURCE_VOLTAGE_V} V</text>

      {/* 开关（闭合） */}
      <circle cx={150} cy={90} r={3.5} fill={wire} />
      <circle cx={195} cy={90} r={3.5} fill={wire} />
      <line x1={150} y1={90} x2={195} y2={90} stroke={wire} strokeWidth={2.5} />
      <text x={172} y={72} textAnchor="middle" fontSize={13} fill={wire}>开关</text>

      {/* 电流表 */}
      <circle cx={290} cy={90} r={20} fill="#fff" stroke={wire} strokeWidth={2} />
      <text x={290} y={96} textAnchor="middle" fontSize={16} fill={wire} fontWeight={600}>A</text>
      <text x={290} y={128} textAnchor="middle" fontSize={13} fill="#b91c1c" fontWeight={600}>
        {currentA.toFixed(2)} A
      </text>

      {/* 定值电阻 */}
      <rect x={400} y={76} width={65} height={28} fill="#fff" stroke={wire} strokeWidth={2} />
      <text x={432} y={64} textAnchor="middle" fontSize={13} fill={wire} fontWeight={600}>
        R = {fixedOhm} Ω
      </text>

      {/* 电压表（并在定值电阻两端） */}
      <line x1={400} y1={104} x2={400} y2={180} stroke={wire} strokeWidth={1.5} />
      <line x1={465} y1={104} x2={465} y2={180} stroke={wire} strokeWidth={1.5} />
      <line x1={400} y1={180} x2={412} y2={180} stroke={wire} strokeWidth={1.5} />
      <line x1={465} y1={180} x2={452} y2={180} stroke={wire} strokeWidth={1.5} />
      <circle cx={432} cy={180} r={20} fill="#fff" stroke={wire} strokeWidth={2} />
      <text x={432} y={186} textAnchor="middle" fontSize={16} fill={wire} fontWeight={600}>V</text>
      <text x={432} y={218} textAnchor="middle" fontSize={13} fill="#b91c1c" fontWeight={600}>
        {resistorVoltV.toFixed(2)} V
      </text>

      {/* 滑动变阻器（底部横放：电阻丝 + 上方金属杆 + 滑片箭头） */}
      <rect x={300} y={300} width={120} height={20} fill="#fff" stroke={wire} strokeWidth={2} />
      <line x1={300} y1={286} x2={470} y2={286} stroke={wire} strokeWidth={2.5} />
      <line x1={470} y1={286} x2={470} y2={310} stroke={wire} strokeWidth={2.5} />
      <line x1={arrowX} y1={286} x2={arrowX} y2={300} stroke="#2563eb" strokeWidth={3} />
      <polygon points={`${arrowX - 6},300 ${arrowX + 6},300 ${arrowX},310`} fill="#2563eb" />
      <text x={360} y={345} textAnchor="middle" fontSize={13} fill={wire}>滑动变阻器（最大 20 Ω）</text>

      {/* 图注 */}
      <text x={70} y={368} fontSize={12} fill="#64748b">
        电路路径：电源 → 开关 → 电流表 → 定值电阻 → 滑动变阻器 → 电源；电压表测定值电阻两端电压。
      </text>
    </svg>
  )
}
