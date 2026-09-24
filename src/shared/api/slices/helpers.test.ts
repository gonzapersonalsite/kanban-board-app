import { afterEach, describe, expect, it } from 'vitest'
import { useI18nStore } from '@/shared/i18n'
import { createBoardData, createInitialKanbanState } from './helpers'

describe('createInitialKanbanState', () => {
  afterEach(() => {
    useI18nStore.getState().setLocale('en')
  })

  it('seeds_every_column_of_the_sample_board_with_tasks', () => {
    const state = createInitialKanbanState(new Date(2026, 0, 15))

    const boardId = state.activeBoardId!
    const columns = state.columnsByBoard[boardId]
    const tasks = state.tasksByBoard[boardId]

    expect(state.boards).toHaveLength(1)
    expect(columns.map((column) => column.title)).toEqual(['To Do', 'In Progress', 'Done'])
    expect(Object.keys(tasks)).toEqual(columns.map((column) => column.id))
    for (const column of columns) {
      expect(tasks[column.id].length).toBeGreaterThan(0)
    }
    expect(tasks[columns[0].id][0]).toMatchObject({
      title: 'Plan the next sprint',
      description: 'Pick the top backlog items, estimate them and agree on the sprint goal.',
    })
  })

  it('sets_sample_due_dates_relative_to_the_first_visit_day', () => {
    const state = createInitialKanbanState(new Date(2026, 0, 31))

    const boardId = state.activeBoardId!
    const dueDates = Object.values(state.tasksByBoard[boardId])
      .flat()
      .map((task) => task.dueDate)
      .filter((dueDate) => dueDate !== undefined)

    expect(dueDates.sort()).toEqual(['2026-01-30', '2026-01-31', '2026-02-03', '2026-02-08'])
  })

  it('gives_every_sample_task_a_unique_id', () => {
    const state = createInitialKanbanState()

    const ids = Object.values(state.tasksByBoard[state.activeBoardId!])
      .flat()
      .map((task) => task.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('localizes_the_sample_board_with_the_current_locale', () => {
    useI18nStore.getState().setLocale('es')

    const state = createInitialKanbanState()

    const boardId = state.activeBoardId!
    const firstColumn = state.columnsByBoard[boardId][0]
    expect(state.boards[0].title).toBe('Mi tablero')
    expect(state.tasksByBoard[boardId][firstColumn.id][0].title).toBe(
      'Planificar el próximo sprint',
    )
  })
})

describe('createBoardData', () => {
  it('creates_new_boards_without_sample_tasks', () => {
    const { columns, tasks } = createBoardData('Roadmap')

    expect(columns).toHaveLength(3)
    expect(Object.values(tasks).flat()).toEqual([])
  })
})
