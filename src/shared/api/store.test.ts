import { describe, expect, it } from 'vitest'
import { migrateKanbanState } from './store'

describe('store migration', () => {
  it('migrates_legacy_flat_state_to_multi_board_shape', () => {
    const legacyState = {
      columns: [
        { id: 'col-1', title: 'To Do' },
        { id: 'col-2', title: 'Done' },
      ],
      tasks: {
        'col-1': [{ id: 'task-1', title: 'Alpha', description: 'First task' }],
      },
    }

    const migrated = migrateKanbanState(legacyState, 0)

    expect(migrated.boards).toHaveLength(1)
    expect(migrated.activeBoardId).toBeTruthy()

    const boardId = migrated.activeBoardId!

    expect(migrated.boards?.[0]?.title).toBe('My Board')
    expect(migrated.columnsByBoard?.[boardId]).toEqual(legacyState.columns)
    expect(migrated.tasksByBoard?.[boardId]?.['col-1']).toEqual(legacyState.tasks['col-1'])
    expect(migrated.tasksByBoard?.[boardId]?.['col-2']).toEqual([])
  })
})
