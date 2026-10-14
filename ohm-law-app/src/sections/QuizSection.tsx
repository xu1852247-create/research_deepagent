import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import type { AnswerRecord, Question } from '@/types/question'
import rawQuestions from '@/data/questions/ohm-law.json'

const questions = rawQuestions as Question[]

/** 数值答案判分：相对误差 ≤ 2% 或绝对误差 ≤ 0.005 视为正确（覆盖有效数字差异） */
function numericCorrect(input: string, answer: string): boolean {
  const got = Number(input)
  const want = Number(answer)
  if (Number.isNaN(got) || Number.isNaN(want)) return false
  return Math.abs(got - want) <= Math.max(0.005, Math.abs(want) * 0.02)
}

/**
 * 题库练习：判分、解析、误区标签；答题记录保存到本地存储。
 * 题目全部为自编，待教师审核。
 */
export default function QuizSection() {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [judged, setJudged] = useState<boolean | null>(null)
  const [records, setRecords] = useLocalStorage<AnswerRecord[]>('ohm-quiz-records', [])

  const q = questions[index]

  // 每题只保留最新一次作答，据此统计正确率
  const latest = new Map<string, AnswerRecord>()
  for (const r of records) latest.set(r.questionId, r)
  const answeredCount = latest.size
  const correctCount = [...latest.values()].filter((r) => r.correct).length

  const submit = () => {
    const correct =
      q.type === 'single_choice' ? selected === q.answer : numericCorrect(input, q.answer)
    setJudged(correct)
    setRecords((prev) => [...prev, { questionId: q.id, correct, answeredAt: Date.now() }])
  }

  const goTo = (next: number) => {
    setIndex(next)
    setSelected(null)
    setInput('')
    setJudged(null)
  }

  const canSubmit = judged === null && (q.type === 'single_choice' ? selected !== null : input.trim() !== '')

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* 答题统计：来自本地真实答题记录 */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-1 p-4 text-lg">
          <span>本章共 {questions.length} 题（自编，待教师审核）</span>
          <span>已答 {answeredCount} 题</span>
          <span>
            正确率{' '}
            <strong>{answeredCount > 0 ? `${Math.round((correctCount / answeredCount) * 100)}%` : '—'}</strong>
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-xl">
              第 {index + 1} / {questions.length} 题
            </CardTitle>
            <Badge variant="secondary">{q.knowledge_point}</Badge>
            <Badge variant="outline">难度 {'★'.repeat(q.difficulty)}</Badge>
            <Badge variant="outline">{q.type === 'single_choice' ? '选择题' : '计算题'}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-lg leading-relaxed">{q.stem}</p>

          {q.type === 'single_choice' && q.options && (
            <div className="space-y-2">
              {q.options.map((opt) => {
                const letter = opt.slice(0, 1)
                const chosen = selected === letter
                return (
                  <button
                    key={opt}
                    disabled={judged !== null}
                    onClick={() => setSelected(letter)}
                    className={`block w-full rounded-lg border-2 p-3 text-left text-lg transition-colors ${
                      chosen ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-400'
                    } ${judged !== null ? 'opacity-80' : ''}`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          )}

          {q.type === 'calculation' && (
            <div className="flex items-center gap-3">
              <Input
                type="number"
                step="any"
                value={input}
                disabled={judged !== null}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入数值（注意题干要求的单位）"
                className="max-w-xs text-lg"
              />
            </div>
          )}

          {judged === null ? (
            <Button size="lg" disabled={!canSubmit} onClick={submit}>
              提交判分
            </Button>
          ) : (
            <div className="space-y-4">
              <p className={`text-xl font-bold ${judged ? 'text-green-700' : 'text-red-700'}`}>
                {judged ? '✓ 回答正确' : `✗ 回答错误，正确答案：${q.type === 'single_choice' ? q.answer : `${q.answer}（见题干单位）`}`}
              </p>
              <div className="space-y-2 rounded-lg bg-slate-100 p-4 text-lg leading-relaxed">
                <p>
                  <strong>解析：</strong>
                  {q.solution}
                </p>
                {q.verification && (
                  <p className="text-base text-slate-700">
                    <strong>验算：</strong>
                    {q.verification}
                  </p>
                )}
                {q.misconception_tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 text-base">
                    <span className="text-slate-600">关联误区：</span>
                    {q.misconception_tags.map((t) => (
                      <Badge key={t} variant="destructive">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                {index < questions.length - 1 && (
                  <Button size="lg" onClick={() => goTo(index + 1)}>
                    下一题
                  </Button>
                )}
                <Button size="lg" variant="outline" onClick={() => goTo(index)}>
                  重做本题
                </Button>
              </div>
            </div>
          )}

          {/* 题目导航 */}
          <div className="flex flex-wrap gap-2 border-t pt-4">
            {questions.map((item, i) => {
              const rec = latest.get(item.id)
              return (
                <button
                  key={item.id}
                  onClick={() => goTo(i)}
                  className={`h-9 w-9 rounded-md border text-sm font-semibold ${
                    i === index ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                  } ${rec ? (rec.correct ? 'bg-green-100' : 'bg-red-100') : ''}`}
                  title={`第 ${i + 1} 题`}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
