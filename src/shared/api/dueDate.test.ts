import { describe, expect, it } from 'vitest'
import { isCalendarDay } from './dueDate'

describe('isCalendarDay', () => {
  it.each(['2026-11-24', '2028-02-29', '0001-01-01', '9999-12-31'])('takes_%s_as_a_day_of_the_calendar', (value) => {
    expect(isCalendarDay(value)).toBe(true)
  })

  it.each([
    ['a year of five digits', '20000-01-01'],
    ['a day its month does not have', '2026-02-30'],
    ['the 29th of February of a year that is not leap', '2026-02-29'],
    ['a month that does not exist', '2026-13-01'],
    ['a day zero', '2026-11-00'],
    ['a date with its time', '2026-11-24T10:00:00Z'],
    ['a date written day first', '24/11/2026'],
    ['a date without its zeros', '2026-1-5'],
    ['a text that is no date', 'tomorrow'],
    ['an empty text', ''],
  ])('refuses_%s', (_what, value) => {
    expect(isCalendarDay(value)).toBe(false)
  })
})
