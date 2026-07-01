import { describe, expect, it } from 'vitest'
import { createKanbanFixture } from '@/test/fixtures/kanbanFixtures'
import { createTestKanbanStore } from '@/test/helpers/storeTestUtils'
import {
  KanbanRestoreError,
  normalizePortableKanbanState,
  restoreKanbanStateInStore,
} from './restore'

describe('kanban restore boundary', () => {
  it('normalizes_portable_state_and_discards_orphaned_data', () => {
    const normalized = normalizePortableKanbanState({
      boards: [{ id: ' board-1 ', title: '  Board 1  ' }],
      activeBoardId: 'board-1',
      columnsByBoard: {
        'board-1': [{ id: ' col-1 ', title: '  Todo  ' }],
        ghost: [{ id: 'ghost-col', title: 'Ghost' }],
      },
      tasksByBoard: {
        'board-1': {
          'col-1': [
            {
              id: ' task-1 ',
              title: '  Task  ',
              description: 'Portable task',
              dueDate: '   ',
            },
          ],
          orphaned: [
            {
              id: 'ghost-task',
              title: 'Ghost task',
              description: '',
            },
          ],
        },
        ghost: {
          'ghost-col': [],
        },
      },
    })

    expect(normalized).toEqual({
      boards: [{ id: 'board-1', title: 'Board 1' }],
      activeBoardId: 'board-1',
      columnsByBoard: {
        'board-1': [{ id: 'col-1', title: 'Todo' }],
      },
      tasksByBoard: {
        'board-1': {
          'col-1': [
            {
              id: 'task-1',
              title: 'Task',
              description: 'Portable task',
            },
          ],
        },
      },
    })
  })

  it('replaces_store_state_atomically_when_snapshot_is_valid', () => {
    const store = createTestKanbanStore()

    const restoredState = restoreKanbanStateInStore(store.setState, {
      boards: [{ id: 'board-restored', title: 'Restored Board' }],
      activeBoardId: 'board-restored',
      columnsByBoard: {
        'board-restored': [{ id: 'col-restored', title: 'Restored Column' }],
      },
      tasksByBoard: {
        'board-restored': {
          'col-restored': [
            {
              id: 'task-restored',
              title: 'Restored Task',
              description: 'From snapshot',
            },
          ],
        },
      },
    })

    const state = store.getState()

    expect(restoredState).toEqual({
      boards: [{ id: 'board-restored', title: 'Restored Board' }],
      activeBoardId: 'board-restored',
      columnsByBoard: {
        'board-restored': [{ id: 'col-restored', title: 'Restored Column' }],
      },
      tasksByBoard: {
        'board-restored': {
          'col-restored': [
            {
              id: 'task-restored',
              title: 'Restored Task',
              description: 'From snapshot',
            },
          ],
        },
      },
    })
    expect(state.boards).toEqual(restoredState.boards)
    expect(state.activeBoardId).toBe('board-restored')
    expect(state.columnsByBoard).toEqual(restoredState.columnsByBoard)
    expect(state.tasksByBoard).toEqual(restoredState.tasksByBoard)
  })

  it('does_not_mutate_store_when_restore_validation_fails', () => {
    const store = createTestKanbanStore()
    const fixture = createKanbanFixture()

    store.setState(fixture)

    const previousState = structuredClone({
      boards: store.getState().boards,
      activeBoardId: store.getState().activeBoardId,
      columnsByBoard: store.getState().columnsByBoard,
      tasksByBoard: store.getState().tasksByBoard,
    })

    expect(() =>
      restoreKanbanStateInStore(store.setState, {
        boards: [{ id: 'board-invalid', title: 'Broken Board' }],
        activeBoardId: 'missing-board',
        columnsByBoard: {
          'board-invalid': [],
        },
        tasksByBoard: {
          'board-invalid': {},
        },
      }),
    ).toThrowError(
      new KanbanRestoreError(
        'Restore state activeBoardId "missing-board" does not exist in boards.',
      ),
    )

    expect({
      boards: store.getState().boards,
      activeBoardId: store.getState().activeBoardId,
      columnsByBoard: store.getState().columnsByBoard,
      tasksByBoard: store.getState().tasksByBoard,
    }).toEqual(previousState)
  })
})
