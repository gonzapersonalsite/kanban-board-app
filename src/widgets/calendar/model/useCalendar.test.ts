import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useCalendar } from './useCalendar'

describe('useCalendar', () => {
  it('initializes_with_current_month_and_year', () => {
    const now = new Date()
    const { result } = renderHook(() => useCalendar())

    expect(result.current.year).toBe(now.getFullYear())
    expect(result.current.month).toBe(now.getMonth())
  })

  it('advances_month_on_goNext', () => {
    const { result } = renderHook(() => useCalendar())

    act(() => result.current.goNext())

    const now = new Date()
    const expectedMonth = now.getMonth() === 11 ? 0 : now.getMonth() + 1
    const expectedYear = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear()

    expect(result.current.month).toBe(expectedMonth)
    expect(result.current.year).toBe(expectedYear)
  })

  it('goes_back_month_on_goPrev', () => {
    const { result } = renderHook(() => useCalendar())

    act(() => result.current.goPrev())

    const now = new Date()
    const expectedMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1
    const expectedYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()

    expect(result.current.month).toBe(expectedMonth)
    expect(result.current.year).toBe(expectedYear)
  })

  it('wraps_year_when_going_from_january_to_previous_month', () => {
    const { result } = renderHook(() => useCalendar())
    const now = new Date()
    const monthsToJan = now.getMonth() + 12

    for (let i = 0; i < monthsToJan; i++) {
      act(() => result.current.goPrev())
    }

    expect(result.current.month).toBe(0)
    expect(result.current.year).toBe(now.getFullYear() - 1)
  })

  it('wraps_year_when_going_from_december_to_next_month', () => {
    const { result } = renderHook(() => useCalendar())
    const now = new Date()
    const monthsToDec = 11 - now.getMonth() + 1

    for (let i = 0; i < monthsToDec; i++) {
      act(() => result.current.goNext())
    }

    expect(result.current.month).toBe(0)
    expect(result.current.year).toBe(now.getFullYear() + 1)
  })

  it('resets_to_today_on_goToday', () => {
    const { result } = renderHook(() => useCalendar())

    act(() => result.current.goNext())
    act(() => result.current.goNext())

    act(() => result.current.goToday())

    const now = new Date()
    expect(result.current.month).toBe(now.getMonth())
    expect(result.current.year).toBe(now.getFullYear())
  })
})
