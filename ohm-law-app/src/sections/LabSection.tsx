import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import CircuitDiagram from '@/components/CircuitDiagram'
import PointChart, { type Point } from '@/components/PointChart'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import {
  RHEOSTAT_MAX_OHM,
  SOURCE_VOLTAGE_V,
  TARGET_VOLTAGE_V,
  computeSeriesCircuit,
  roundTo,
} from '@/physics/ohm'

const RESISTOR_OPTIONS = [5, 10, 15, 20]
const ON_TARGET_TOLERANCE_V = 0.03

/**
 * 交互实验：欧姆定律与滑动变阻器（仿真规范 A）。
 * 自变量：滑片位置（滑变接入电阻）、定值电阻（实验二更换）。
 * 因变量：电流表示数、电压表示数（定值电阻两端电压）。
 * 控制变量：实验一保持 R 不变；实验二保持 R 两端电压 3.0 V 不变。
 */
export default function LabSection() {
  const [mode, setMode] = useState<'u' | 'r'>('u')
  const [slider, setSlider] = useState(50)
  const [fixedOhm, setFixedOhm] = useState(10)
  const [uRecords, setURecords] = useLocalStorage<Point[]>('ohm-exp-u-records', [])
  const [rRecords, setRRecords] = useLocalStorage<Point[]>('ohm-exp-r-records', [])

  const reading = useMemo(
    () => computeSeriesCircuit(SOURCE_VOLTAGE_V, fixedOhm, slider),
    [fixedOhm, slider],
  )
  const onTarget = Math.abs(reading.resistorVoltV - TARGET_VOLTAGE_V) <= ON_TARGET_TOLERANCE_V

  const recordU = () => {
    const pt = { x: roundTo(reading.resistorVoltV, 2), y: roundTo(reading.currentA, 3) }
    setURecords((prev) => [...prev.filter((p) => Math.abs(p.x - pt.x) > 1e-6), pt])
  }
  const recordR = () => {
    const pt = { x: fixedOhm, y: roundTo(reading.currentA, 3) }
    setRRecords((prev) => [...prev.filter((p) => p.x !== pt.x), pt])
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* 实验切换 */}
      <div className="flex flex-wrap gap-3">
        <Button size="lg" variant={mode === 'u' ? 'default' : 'outline'} onClick={() => setMode('u')}>
          实验一：电流与电压的关系
        </Button>
        <Button size="lg" variant={mode === 'r' ? 'default' : 'outline'} onClick={() => setMode('r')}>
          实验二：电流与电阻的关系
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 text-lg">
          {mode === 'u'
            ? `实验目的：保持定值电阻 R = 10 Ω 不变，调节滑动变阻器改变 R 两端的电压，记录电压表与电流表示数，探究电流与电压的关系。`
            : `实验目的：更换不同阻值的定值电阻，每次调节滑动变阻器使电压表示数保持 ${TARGET_VOLTAGE_V.toFixed(1)} V 不变，记录电流表示数，探究电流与电阻的关系。`}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 左：电路图 + 读数 */}
        <div className="space-y-4">
          <CircuitDiagram
            fixedOhm={fixedOhm}
            sliderPercent={slider}
            currentA={reading.currentA}
            resistorVoltV={reading.resistorVoltV}
          />
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">三个电压要分清</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 text-base">
              <div className="rounded bg-slate-100 p-2">电源电压：{SOURCE_VOLTAGE_V.toFixed(1)} V</div>
              <div className="rounded bg-slate-100 p-2">
                电压表（R 两端）：<strong>{reading.resistorVoltV.toFixed(2)} V</strong>
              </div>
              <div className="rounded bg-slate-100 p-2">
                滑变两端电压：{reading.rheostatVoltV.toFixed(2)} V
              </div>
              <div className="rounded bg-slate-100 p-2">
                滑变接入电阻：{reading.rheostatOhm.toFixed(1)} Ω
              </div>
              <div className="col-span-2 rounded bg-blue-50 p-2 text-blue-900">
                电流表：<strong>{reading.currentA.toFixed(3)} A</strong>（= {roundTo(reading.currentA * 1000, 0)} mA）
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右：控制 + 记录 + 图表 */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">控制变量</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {mode === 'u' ? (
                <p className="text-base text-slate-600">
                  定值电阻 <Badge variant="secondary">R = 10 Ω（保持不变）</Badge>
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-base text-slate-600">更换定值电阻（Ω）：</p>
                  <div className="flex gap-2">
                    {RESISTOR_OPTIONS.map((r) => (
                      <Button
                        key={r}
                        variant={fixedOhm === r ? 'default' : 'outline'}
                        onClick={() => setFixedOhm(r)}
                      >
                        {r} Ω
                      </Button>
                    ))}
                  </div>
                  <p className={`text-base font-semibold ${onTarget ? 'text-green-700' : 'text-amber-700'}`}>
                    {onTarget
                      ? `✓ 电压表示数已保持 ${TARGET_VOLTAGE_V.toFixed(1)} V，可以记录数据`
                      : `请调节滑片，使电压表示数回到 ${TARGET_VOLTAGE_V.toFixed(1)} V 后再记录`}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-base text-slate-600">滑片位置：{slider}%</p>
                <Slider value={[slider]} min={0} max={100} step={1} onValueChange={([v]) => setSlider(v)} />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">或直接输入：</span>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={slider}
                    onChange={(e) => {
                      const v = Number(e.target.value)
                      if (!Number.isNaN(v)) setSlider(Math.min(100, Math.max(0, Math.round(v))))
                    }}
                    className="w-24"
                  />
                  <span className="text-sm text-slate-500">%</span>
                </div>
              </div>

              <div className="flex gap-3">
                {mode === 'u' ? (
                  <>
                    <Button size="lg" onClick={recordU}>记录数据</Button>
                    <Button size="lg" variant="outline" onClick={() => setURecords([])}>清空记录</Button>
                  </>
                ) : (
                  <>
                    <Button size="lg" disabled={!onTarget} onClick={recordR}>记录数据</Button>
                    <Button size="lg" variant="outline" onClick={() => setRRecords([])}>清空记录</Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{mode === 'u' ? 'I-U 图像' : 'I-R 数据'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mode === 'u' ? (
                <PointChart points={uRecords} xLabel="U/V" yLabel="I/A" xMax={6} yMax={0.6} proportionalLine />
              ) : (
                <PointChart points={rRecords} xLabel="R/Ω" yLabel="I/A" xMax={20} yMax={0.6} />
              )}

              {(mode === 'u' ? uRecords : rRecords).length > 0 && (
                <table className="w-full border-collapse text-center text-base">
                  <thead>
                    <tr className="border-b">
                      <th className="p-1">次数</th>
                      <th className="p-1">{mode === 'u' ? '电压 U/V' : '电阻 R/Ω'}</th>
                      <th className="p-1">电流 I/A</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(mode === 'u' ? uRecords : rRecords).map((p, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-1">{i + 1}</td>
                        <td className="p-1">{p.x}</td>
                        <td className="p-1">{p.y}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {mode === 'u' && uRecords.length >= 3 && (
                <p className="rounded-lg bg-green-50 p-3 text-lg font-semibold text-green-900">
                  结论：电阻一定时，通过导体的电流与导体两端的电压成正比（图像为过原点的直线）。
                </p>
              )}
              {mode === 'r' && rRecords.length >= 3 && (
                <p className="rounded-lg bg-green-50 p-3 text-lg font-semibold text-green-900">
                  结论：电压一定时，通过导体的电流与导体的电阻成反比（R 增大几倍，I 缩小为原来的几分之一）。
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 理想化假设与滑变作用 */}
      <Card>
        <CardContent className="space-y-2 p-4 text-base text-slate-600">
          <p>
            <strong>滑动变阻器的作用：</strong>①保护电路；②实验一中改变定值电阻两端的电压；③实验二中保持定值电阻两端电压不变。
          </p>
          <p>
            <strong>理想化假设：</strong>电源无内阻；电流表内阻为零、电压表内阻无穷大（理想电表）；导线电阻为零；定值电阻阻值不随温度变化。滑动变阻器规格“{RHEOSTAT_MAX_OHM} Ω 1 A”。
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
