import { useEffect, useState } from 'react'

/** 读写 localStorage 的状态钩子：刷新和重新打开后数据仍可读取。 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // 存储不可用时静默降级为内存态
    }
  }, [key, value])

  return [value, setValue] as const
}
