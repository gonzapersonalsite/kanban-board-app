import { useState, useCallback } from 'react'

export function useCalendar() {
  const now = new Date()
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() })

  const goNext = useCallback(() => {
    setCursor((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 }
      return { year: prev.year, month: prev.month + 1 }
    })
  }, [])

  const goPrev = useCallback(() => {
    setCursor((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 }
      return { year: prev.year, month: prev.month - 1 }
    })
  }, [])

  const goToday = useCallback(() => {
    const today = new Date()
    setCursor({ year: today.getFullYear(), month: today.getMonth() })
  }, [])

  return { ...cursor, goNext, goPrev, goToday } as const
}
