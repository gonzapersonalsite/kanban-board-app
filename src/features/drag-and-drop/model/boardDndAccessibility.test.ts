import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useKanbanStore } from '@/shared/api'
import { useI18nStore } from '@/shared/i18n'
import {
  COLUMN_DONE_ID,
  COLUMN_PROGRESS_ID,
  COLUMN_TODO_ID,
  TASK_ALPHA_ID,
  TASK_BETA_ID,
} from '@/test/fixtures/kanbanFixtures'
import { setupKanbanStore } from '@/test/setup/kanbanStoreSetup'
import { boardDndAnnouncements, withBoardDndAnnouncements } from './boardDndAccessibility'

interface EntityRef {
  id: string
  type: 'task' | 'column'
  data?: { columnId: string }
}

// Mirrors the dnd-kit event shape: `canceled` is on the event and on its operation snapshot.
function dragEvent<T>(source: EntityRef | null, target: EntityRef | null = null, canceled = false) {
  return { operation: { source, target, canceled }, canceled } as unknown as T
}

describe('boardDndAnnouncements', () => {
  setupKanbanStore()

  afterEach(() => {
    useI18nStore.getState().setLocale('en')
  })

  it('announces_the_picked_up_task_by_title', () => {
    const event = dragEvent<DragStartEvent>({ id: TASK_ALPHA_ID, type: 'task' })

    expect(boardDndAnnouncements.dragstart(event)).toBe('Picked up task "Alpha".')
  })

  it('announces_the_column_under_a_dragged_task', () => {
    const event = dragEvent<DragOverEvent>(
      { id: TASK_ALPHA_ID, type: 'task' },
      { id: TASK_BETA_ID, type: 'task', data: { columnId: COLUMN_TODO_ID } },
    )

    expect(boardDndAnnouncements.dragover(event)).toBe('Task "Alpha" is over column "To Do".')
  })

  it('stays_silent_while_the_item_is_over_itself', () => {
    const event = dragEvent<DragOverEvent>(
      { id: COLUMN_TODO_ID, type: 'column' },
      { id: COLUMN_TODO_ID, type: 'column', data: { columnId: COLUMN_TODO_ID } },
    )

    expect(boardDndAnnouncements.dragover(event)).toBeUndefined()
  })

  it('announces_the_column_where_a_task_was_dropped', () => {
    useKanbanStore.getState().moveTask(COLUMN_TODO_ID, COLUMN_DONE_ID, TASK_ALPHA_ID, 0)
    const event = dragEvent<DragEndEvent>({ id: TASK_ALPHA_ID, type: 'task' })

    expect(boardDndAnnouncements.dragend(event)).toBe('Task "Alpha" was dropped in column "Done".')
  })

  it('announces_the_new_position_of_a_dropped_column', () => {
    useKanbanStore.getState().reorderColumns(0, 2)
    const event = dragEvent<DragEndEvent>({ id: COLUMN_TODO_ID, type: 'column' })

    expect(boardDndAnnouncements.dragend(event)).toBe(
      'Column "To Do" was dropped at position 3 of 3.',
    )
  })

  it('announces_a_cancelled_move', () => {
    const event = dragEvent<DragEndEvent>({ id: COLUMN_PROGRESS_ID, type: 'column' }, null, true)

    expect(boardDndAnnouncements.dragend(event)).toBe(
      'Move cancelled. "In Progress" is back in its original position.',
    )
  })

  it('uses_the_current_locale_when_the_event_fires', () => {
    useI18nStore.getState().setLocale('es')
    const event = dragEvent<DragStartEvent>({ id: COLUMN_PROGRESS_ID, type: 'column' })

    expect(boardDndAnnouncements.dragstart(event)).toBe('Has cogido la columna "In Progress".')
  })

  it('stays_silent_for_unknown_draggables', () => {
    const event = dragEvent<DragStartEvent>({ id: 'missing-task', type: 'task' })

    expect(boardDndAnnouncements.dragstart(event)).toBeUndefined()
  })
})

describe('withBoardDndAnnouncements', () => {
  it('hands_the_announcements_to_every_default_plugin', () => {
    class FirstPlugin {}
    class SecondPlugin {}
    const defaults = [FirstPlugin, SecondPlugin] as unknown as Parameters<
      typeof withBoardDndAnnouncements
    >[0]

    const plugins = withBoardDndAnnouncements(defaults)

    expect(plugins).toEqual([
      { plugin: FirstPlugin, options: { announcements: boardDndAnnouncements } },
      { plugin: SecondPlugin, options: { announcements: boardDndAnnouncements } },
    ])
  })
})
