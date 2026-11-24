// A due date is what a date field gives: a day of the calendar written YYYY-MM-DD. The screens format
// it without asking, so any other text breaks them: #a-due-date-is-a-day-of-the-calendar
export function isCalendarDay(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) {
    return false
  }

  const [year, month, day] = match.slice(1).map(Number)
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)

  // A day that does not exist rolls over into the next month.
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}
