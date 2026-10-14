import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import LabSection from '@/sections/LabSection'
import LearnSection from '@/sections/LearnSection'
import MisconceptionSection from '@/sections/MisconceptionSection'
import QuizSection from '@/sections/QuizSection'
import RoadmapSection from '@/sections/RoadmapSection'

export default function Home() {
  const [tab, setTab] = useState('learn')

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5">
          <h1 className="text-2xl font-bold text-slate-900">欧姆定律 · 交互学习</h1>
          <p className="mt-1 text-sm text-slate-500">
            初中物理 · 人教版九年级全一册 第十七章（版次待确认） · 自编内容待教师审核
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="learn">学习讲解</TabsTrigger>
            <TabsTrigger value="lab">交互实验</TabsTrigger>
            <TabsTrigger value="misconception">误区辨析</TabsTrigger>
            <TabsTrigger value="quiz">题库练习</TabsTrigger>
            <TabsTrigger value="roadmap">功能路线图</TabsTrigger>
          </TabsList>
          <TabsContent value="learn">
            <LearnSection onNavigate={setTab} />
          </TabsContent>
          <TabsContent value="lab">
            <LabSection />
          </TabsContent>
          <TabsContent value="misconception">
            <MisconceptionSection />
          </TabsContent>
          <TabsContent value="quiz">
            <QuizSection />
          </TabsContent>
          <TabsContent value="roadmap">
            <RoadmapSection />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
