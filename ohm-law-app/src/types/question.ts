export type QuestionType = 'single_choice' | 'calculation'

/** 题库统一结构（见 physics_dev_system_prompt.md 题库数据格式） */
export interface Question {
  id: string
  chapter: string
  knowledge_point: string
  type: QuestionType
  difficulty: 1 | 2 | 3
  stem: string
  options?: string[]
  answer: string
  solution: string
  misconception_tags: string[]
  verification?: string
  source: string
}

/** 本地保存的答题记录 */
export interface AnswerRecord {
  questionId: string
  correct: boolean
  answeredAt: number
}
