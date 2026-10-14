import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Misconception {
  id: string
  statement: string
  explanation: string
  reason: string
}

const ITEMS: Misconception[] = [
  {
    id: 'm1',
    statement: '电流流过电阻后会被“消耗”，所以流过电阻之后电流变小了。',
    explanation: '错误。串联电路中各处电流相等，流入电阻的电流和流出电阻的电流一样大。',
    reason: '电阻消耗的是电能（转化为内能等其他形式的能），而不是电流。电流是电荷的定向移动，电荷不会凭空减少。可以用电流表分别在电阻前后测量，两次读数相同。',
  },
  {
    id: 'm2',
    statement: '电压就是电流，二者是一回事。',
    explanation: '错误。电压和电流是两个不同的物理量：电压的单位是伏特（V），电流的单位是安培（A）。',
    reason: '电压是使自由电荷定向移动、从而形成电流的原因。开关断开时电源两端仍有电压，但电路中没有电流——有电压不一定有电流；但电路中有电流时，电路两端一定有电压。',
  },
  {
    id: 'm3',
    statement: '调节滑动变阻器时，和它串联的定值电阻的阻值也会跟着改变。',
    explanation: '错误。定值电阻的阻值由它自身的材料、长度、横截面积（和温度）决定，与滑动变阻器无关。',
    reason: '调节滑变改变的是电路的总电阻，从而改变电流和电压的分配。无论滑片怎么动，用 R = U / I 算出的定值电阻阻值始终不变——可以在「交互实验」里拖一拖滑块亲自验证。',
  },
]

/** 误区辨析：先判断正误，再给出正确解释和原因（教学红线 2）。 */
export default function MisconceptionSection() {
  const [answers, setAnswers] = useState<Record<string, boolean>>({})
  const [judged, setJudged] = useState<Record<string, boolean>>({})

  const answer = (id: string, userSaysCorrect: boolean) => {
    setAnswers((prev) => ({ ...prev, [id]: userSaysCorrect }))
    // 三句话都是错误观点：用户判断“错误”即为答对
    setJudged((prev) => ({ ...prev, [id]: userSaysCorrect === false }))
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <p className="text-lg text-slate-600">
        下面三句话都来自同学们作业里的真实高频错误。先判断每句话<strong>是否正确</strong>，再看解析。
      </p>
      {ITEMS.map((item, i) => {
        const hasAnswered = item.id in answers
        const correct = judged[item.id]
        return (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle className="text-xl">
                误区 {i + 1}：{item.statement}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!hasAnswered ? (
                <div className="flex gap-3">
                  <Button size="lg" variant="outline" onClick={() => answer(item.id, true)}>
                    这句话正确
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => answer(item.id, false)}>
                    这句话错误
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 text-lg leading-relaxed">
                  <p className={correct ? 'font-semibold text-green-700' : 'font-semibold text-red-700'}>
                    {correct ? '✓ 判断正确！' : '✗ 这句话其实是错误的。'}
                  </p>
                  <p>{item.explanation}</p>
                  <p className="rounded-lg bg-slate-100 p-3 text-base">
                    <strong>原因：</strong>{item.reason}
                  </p>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setAnswers((prev) => {
                        const next = { ...prev }
                        delete next[item.id]
                        return next
                      })
                    }
                  >
                    再判断一次
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
