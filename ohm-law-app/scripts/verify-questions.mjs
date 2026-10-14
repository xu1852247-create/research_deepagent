#!/usr/bin/env node
/**
 * 题库与物理数值校验脚本（node scripts/verify-questions.mjs）。
 *
 * 校验内容：
 * 1. 基准核验：6 V / 10 Ω = 0.6 A；600 mA = 0.6 A。
 * 2. 每题必填字段、id 唯一、source 标注"待教师审核"。
 * 3. calculation 题的 verification 验算式逐项重算（容差 0.5%）。
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const file = join(here, '..', 'src', 'data', 'questions', 'ohm-law.json')
const questions = JSON.parse(readFileSync(file, 'utf-8'))

let failures = 0
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`)
  if (!ok) failures += 1
}
const near = (a, b) => Math.abs(a - b) <= Math.abs(b) * 0.005 + 1e-9

// 1) 基准核验
check('基准: 6 V / 10 Ω = 0.6 A', near(6 / 10, 0.6))
check('基准: 600 mA = 0.6 A', near(600 / 1000, 0.6))

// 2) 验算式解析：支持的四种物理运算形式
function verifyArithmetic(v) {
  let m
  if ((m = v.match(/^([\d.]+) V \/ \(([\d.]+) Ω \+ ([\d.]+) Ω\) = ([\d.]+) A$/))) {
    return near(Number(m[1]) / (Number(m[2]) + Number(m[3])), Number(m[4]))
  }
  if ((m = v.match(/^([\d.]+) V \/ ([\d.]+) Ω = ([\d.]+) A$/))) {
    return near(Number(m[1]) / Number(m[2]), Number(m[3]))
  }
  if ((m = v.match(/^([\d.]+) A × ([\d.]+) Ω = ([\d.]+) V$/))) {
    return near(Number(m[1]) * Number(m[2]), Number(m[3]))
  }
  if ((m = v.match(/^([\d.]+) V \/ ([\d.]+) A = ([\d.]+) Ω$/))) {
    return near(Number(m[1]) / Number(m[2]), Number(m[3]))
  }
  return null // 无法识别的格式
}

// 3) 逐题校验
const ids = new Set()
for (const q of questions) {
  check(`${q.id} id 唯一`, !ids.has(q.id))
  ids.add(q.id)
  for (const k of ['chapter', 'knowledge_point', 'type', 'difficulty', 'stem', 'answer', 'solution', 'source']) {
    check(`${q.id} 必填字段 ${k}`, q[k] !== undefined && q[k] !== '')
  }
  check(`${q.id} 标注审核状态`, String(q.source).includes('待教师审核'))
  if (q.type === 'single_choice') {
    check(`${q.id} 选项 ≥ 3`, Array.isArray(q.options) && q.options.length >= 3)
    check(`${q.id} 答案为选项字母`, /^[A-Z]$/.test(q.answer))
  }
  if (q.type === 'calculation') {
    check(`${q.id} 含 verification`, typeof q.verification === 'string' && q.verification.length > 0)
    const ok = q.verification ? verifyArithmetic(q.verification) : false
    check(`${q.id} 验算成立`, ok === true, q.verification ?? '')
    check(`${q.id} 答案为数值`, !Number.isNaN(Number(q.answer)))
  }
}

console.log(failures === 0 ? '\n全部校验通过' : `\n${failures} 项未通过`)
process.exit(failures === 0 ? 0 : 1)
