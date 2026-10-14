import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface Item {
  name: string
  status: '已实现' | '待实现'
  note?: string
}

const ITEMS: Item[] = [
  { name: '章节学习：欧姆定律（情境 → 定义 → 公式 → 例题）', status: '已实现' },
  { name: '交互实验：欧姆定律与滑动变阻器仿真', status: '已实现' },
  { name: '误区辨析：3 个高频误区互动判断', status: '已实现' },
  { name: '题库练习：欧姆定律 10 题（自编，待教师审核）与判分解析', status: '已实现' },
  { name: '答题记录与实验数据本地保存', status: '已实现' },
  { name: '错题复习：自动归档、重练与复习计划', status: '待实现', note: '第二批' },
  { name: '学情报告：正确率、知识点表现、学习进度', status: '待实现', note: '第二批' },
  { name: '凸透镜成像仿真', status: '待实现', note: '后续模块' },
  { name: '串并联电路搭建', status: '待实现', note: '后续模块' },
  { name: '教师功能：导入题目、组卷、布置作业', status: '待实现', note: '后续规划' },
  { name: 'AI 答疑 / 拍照识别', status: '待实现', note: '需服务端与密钥配置' },
]

/** 功能路线图：已实现与待实现一目了然，待实现项不伪装成可用按钮。 */
export default function RoadmapSection() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <p className="text-lg text-slate-600">本章为首批最小样例（欧姆定律）。完整功能路线图如下：</p>
      {ITEMS.map((item) => (
        <Card key={item.name} className={item.status === '待实现' ? 'opacity-70' : ''}>
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <span className="text-lg">{item.name}</span>
            <div className="flex items-center gap-2">
              {item.note && <Badge variant="outline">{item.note}</Badge>}
              <Badge variant={item.status === '已实现' ? 'default' : 'secondary'}>{item.status}</Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
