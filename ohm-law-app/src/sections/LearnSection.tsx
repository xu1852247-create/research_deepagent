import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  onNavigate: (tab: string) => void
}

/**
 * 章节学习：生活情境 → 定义 → 规律/公式 → 例题（教学红线 1，顺序不可颠倒）。
 * 教材依据：人教版九年级全一册 第十七章《欧姆定律》（版次待确认）。
 */
export default function LearnSection({ onNavigate }: Props) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">人教版九年级全一册 · 第十七章《欧姆定律》（版次待确认）</Badge>
        <Badge variant="outline">自编内容，待教师审核</Badge>
      </div>

      {/* 第一步：生活情境 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">一、生活情境</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-lg leading-relaxed">
          <p>台灯上有个旋钮，拧一拧，灯光就变亮或变暗；电风扇的调速开关一拨，风量就变了。</p>
          <p>
            这些变化本质上都是<strong>通过用电器的电流改变了</strong>。那么，电流的大小到底由什么决定？
            电压、电阻和电流之间有什么关系？这正是德国物理学家欧姆研究了近十年才搞清楚的问题。
          </p>
        </CardContent>
      </Card>

      {/* 第二步：定义 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">二、定义：欧姆定律</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-lg leading-relaxed">
          <p className="rounded-lg bg-blue-50 p-4 font-semibold text-blue-900">
            导体中的电流，跟导体两端的电压成正比，跟导体的电阻成反比。
          </p>
          <p>
            这个结论来自实验：电阻一定时，电压增大几倍，电流就增大几倍；电压一定时，电阻增大几倍，
            电流就缩小为原来的几分之一。你可以到「交互实验」里亲手验证这两条规律。
          </p>
        </CardContent>
      </Card>

      {/* 第三步：规律/公式 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">三、公式</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border-2 border-blue-600 bg-blue-50 p-6 text-center">
            <span className="text-4xl font-bold tracking-wider text-blue-900">I = U / R</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-lg">
            <div className="rounded-lg bg-slate-100 p-3">I：电流，单位安培（A）</div>
            <div className="rounded-lg bg-slate-100 p-3">U：电压，单位伏特（V）</div>
            <div className="rounded-lg bg-slate-100 p-3">R：电阻，单位欧姆（Ω）</div>
          </div>
          <p className="text-lg">变形公式：<strong>U = I × R</strong>、<strong>R = U / I</strong>。</p>
          <p className="rounded-lg bg-amber-50 p-3 text-base text-amber-900">
            适用条件：I、U、R 必须是<strong>同一段导体</strong>在<strong>同一时刻</strong>的值；
            R = U / I 只是电阻的计算式，电阻是导体本身的性质，不随电压、电流改变。
          </p>
        </CardContent>
      </Card>

      {/* 第四步：例题 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">四、例题</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-lg leading-relaxed">
          <div className="space-y-1 rounded-lg border p-4">
            <p className="font-semibold">例 1：一个 10 Ω 的定值电阻，两端加上 6 V 电压，通过它的电流是多少？</p>
            <p>已知量：U = 6 V，R = 10 Ω → 公式：I = U / R → 代入：I = 6 V ÷ 10 Ω → 结果：<strong>I = 0.6 A</strong></p>
          </div>
          <div className="space-y-1 rounded-lg border p-4">
            <p className="font-semibold">例 2：通过一个 12 Ω 电阻的电流是 0.5 A，它两端的电压是多少？</p>
            <p>已知量：I = 0.5 A，R = 12 Ω → 公式：U = I × R → 代入：U = 0.5 A × 12 Ω → 结果：<strong>U = 6 V</strong></p>
          </div>
        </CardContent>
      </Card>

      {/* 误区辨析入口 */}
      <Card className="border-orange-300">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
          <p className="text-lg">
            本节有 <strong>3 个高频误区</strong>（电流被电阻消耗、电压就是电流、滑变改变定值电阻），去辨析一下吧。
          </p>
          <Button size="lg" onClick={() => onNavigate('misconception')}>进入误区辨析</Button>
        </CardContent>
      </Card>
    </div>
  )
}
