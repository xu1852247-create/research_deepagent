// 欧姆定律与串联滑动变阻器电路的纯函数计算模块。
// 仿真与题库共用本模块（教学红线 6），不依赖任何 UI。
// 理想化假设：电源无内阻；电流表内阻为零；电压表内阻无穷大；
// 导线电阻为零；定值电阻阻值不随温度变化。

/** 滑动变阻器规格：最大阻值 20 Ω（铭牌“20Ω 1A”） */
export const RHEOSTAT_MAX_OHM = 20

/** 实验电源电压：6 V（学生电源） */
export const SOURCE_VOLTAGE_V = 6

/** 实验二控制变量：保持定值电阻两端电压 3.0 V 不变 */
export const TARGET_VOLTAGE_V = 3

export interface CircuitReading {
  /** 滑动变阻器接入电路的阻值（Ω） */
  rheostatOhm: number
  /** 电流表示数（A） */
  currentA: number
  /** 电压表示数，即定值电阻两端电压（V） */
  resistorVoltV: number
  /** 滑动变阻器两端电压（V） */
  rheostatVoltV: number
}

/** 欧姆定律：I = U / R */
export function currentFromOhmLaw(voltageV: number, resistanceOhm: number): number {
  if (resistanceOhm <= 0) throw new RangeError('电阻必须大于 0')
  return voltageV / resistanceOhm
}

/** 欧姆定律变形：U = I · R */
export function voltageFromOhmLaw(currentA: number, resistanceOhm: number): number {
  if (resistanceOhm <= 0) throw new RangeError('电阻必须大于 0')
  return currentA * resistanceOhm
}

/** 欧姆定律变形：R = U / I（R 是导体本身的性质，不随 U、I 改变） */
export function resistanceFromOhmLaw(voltageV: number, currentA: number): number {
  if (currentA <= 0) throw new RangeError('电流必须大于 0')
  return voltageV / currentA
}

/** 单位换算：毫安 → 安培 */
export function milliAmpToAmp(milliAmp: number): number {
  return milliAmp / 1000
}

/** 滑块位置（0~100%）→ 接入电阻（Ω） */
export function rheostatResistanceOhm(sliderPercent: number, maxOhm: number = RHEOSTAT_MAX_OHM): number {
  const clamped = Math.min(100, Math.max(0, sliderPercent))
  return (clamped / 100) * maxOhm
}

/**
 * 串联电路整体求解：电源 — 开关 — 电流表 — 定值电阻 R — 滑动变阻器 串联，
 * 电压表并在定值电阻两端。
 */
export function computeSeriesCircuit(
  sourceVoltV: number,
  fixedResistanceOhm: number,
  sliderPercent: number,
): CircuitReading {
  const rheostatOhm = rheostatResistanceOhm(sliderPercent)
  const currentA = currentFromOhmLaw(sourceVoltV, fixedResistanceOhm + rheostatOhm)
  return {
    rheostatOhm,
    currentA,
    resistorVoltV: voltageFromOhmLaw(currentA, fixedResistanceOhm),
    rheostatVoltV: voltageFromOhmLaw(currentA, rheostatOhm),
  }
}

/** 显示用四舍五入 */
export function roundTo(value: number, digits = 3): number {
  const k = 10 ** digits
  return Math.round(value * k) / k
}
