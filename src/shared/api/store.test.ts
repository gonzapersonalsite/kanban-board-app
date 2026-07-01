import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useToastStore } from '@/shared/ui'
import { useKanbanStore } from './store'
import { createSafeStorage, migrateKanbanState } from './store'

describe('store migration', () => {
  beforeEach(() => {
    useToastStore.setState({ notifications: [] })
  })

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

  it('shows_an_error_when_persisted_storage_cannot_be_saved', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError')
    })
    const storage = createSafeStorage()

    storage.setItem('kanban-board-storage', {
      state: {
        ...useKanbanStore.getState(),
        boards: [],
        activeBoardId: null,
        columnsByBoard: {},
        tasksByBoard: {},
      },
      version: 1,
    })

    expect(setItemSpy).toHaveBeenCalled()
    expect(useToastStore.getState().notifications.at(-1)?.message).toBe(
      'Failed to save data. Check available storage space.',
    )
  })

  it('falls_back_to_null_and_notifies_when_persisted_storage_is_corrupted', () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('{broken-json')
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {})
    const storage = createSafeStorage()

    const value = storage.getItem('kanban-board-storage')

    expect(getItemSpy).toHaveBeenCalled()
    expect(value).toBeNull()
    expect(removeItemSpy).toHaveBeenCalledWith('kanban-board-storage')
    expect(useToastStore.getState().notifications.at(-1)?.message).toBe(
      'Failed to load saved data. Starting with default board.',
    )
  })
})
