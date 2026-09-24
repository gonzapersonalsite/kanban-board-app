import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useToastStore } from '@/shared/ui'
import { createKanbanFixture } from '@/test/fixtures/kanbanFixtures'
import { createTestKanbanStore } from '@/test/helpers/storeTestUtils'
import { createInitialKanbanState } from './slices/helpers'
import type { KanbanState, PortableKanbanState } from './slices/types'
import { useKanbanStore } from './store'
import { createSafeStorage, KANBAN_STORAGE_KEY, migrateKanbanState } from './store'

function pickPortableState(state: KanbanState): PortableKanbanState {
  const { boards, activeBoardId, columnsByBoard, tasksByBoard } = state

  return { boards, activeBoardId, columnsByBoard, tasksByBoard }
}

// A fresh module graph gives a fresh kanban store wired to a fresh i18n store, exactly as
// the app creates them on page load.
async function loadFreshStores() {
  vi.resetModules()
  const { useKanbanStore: freshKanbanStore } = await import('./store')
  const { useI18nStore: freshI18nStore } = await import('@/shared/i18n')

  return { useKanbanStore: freshKanbanStore, useI18nStore: freshI18nStore }
}

function getSampleTexts(state: PortableKanbanState) {
  const boardId = state.activeBoardId!
  const [firstColumn] = state.columnsByBoard[boardId]

  return {
    board: state.boards[0].title,
    firstColumn: firstColumn.title,
    firstTask: state.tasksByBoard[boardId][firstColumn.id][0].title,
  }
}

describe('store creator', () => {
  it('starts_with_the_sample_board_and_tasks_in_every_column', () => {
    const state = createTestKanbanStore().getState()

    const boardId = state.activeBoardId!
    const columns = state.columnsByBoard[boardId]
    expect(state.boards).toHaveLength(1)
    expect(columns).toHaveLength(3)
    for (const column of columns) {
      expect(state.tasksByBoard[boardId][column.id].length).toBeGreaterThan(0)
    }
  })
})

describe('sample board lifecycle', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts_with_the_sample_board_and_persists_nothing_when_storage_is_empty', async () => {
    const { useKanbanStore: store } = await loadFreshStores()

    const state = store.getState()
    expect(getSampleTexts(state)).toEqual({
      board: 'My board',
      firstColumn: 'To do',
      firstTask: 'Plan the next sprint',
    })
    expect(localStorage.getItem(KANBAN_STORAGE_KEY)).toBeNull()
  })

  it('follows_the_locale_without_persisting_while_the_sample_is_untouched', async () => {
    const { useKanbanStore: store, useI18nStore: i18n } = await loadFreshStores()
    const before = store.getState()

    i18n.getState().setLocale('es')

    const after = store.getState()
    expect(getSampleTexts(after)).toEqual({
      board: 'Mi tablero',
      firstColumn: 'Por hacer',
      firstTask: 'Planificar el próximo sprint',
    })
    expect(after.activeBoardId).toBe(before.activeBoardId)
    expect(after.columnsByBoard[after.activeBoardId!].map((column) => column.id)).toEqual(
      before.columnsByBoard[before.activeBoardId!].map((column) => column.id),
    )
    expect(localStorage.getItem(KANBAN_STORAGE_KEY)).toBeNull()
  })

  it('persists_the_first_change_and_stops_following_the_locale', async () => {
    const { useKanbanStore: store, useI18nStore: i18n } = await loadFreshStores()
    const state = store.getState()
    const firstColumnId = state.columnsByBoard[state.activeBoardId!][0].id

    store.getState().addTask(firstColumnId, 'My own task')
    i18n.getState().setLocale('de')

    const after = store.getState()
    const persisted = JSON.parse(localStorage.getItem(KANBAN_STORAGE_KEY)!)
    expect(getSampleTexts(after)).toEqual({
      board: 'My board',
      firstColumn: 'To do',
      firstTask: 'Plan the next sprint',
    })
    expect(after.tasksByBoard[after.activeBoardId!][firstColumnId].at(-1)?.title).toBe(
      'My own task',
    )
    expect(persisted.state.tasksByBoard).toEqual(after.tasksByBoard)
  })

  it('never_changes_persisted_user_data_when_the_locale_changes', async () => {
    const userData = createKanbanFixture()
    const storedValue = JSON.stringify({ state: userData, version: 1 })
    localStorage.setItem(KANBAN_STORAGE_KEY, storedValue)
    const { useKanbanStore: store, useI18nStore: i18n } = await loadFreshStores()

    i18n.getState().setLocale('es')

    expect(pickPortableState(store.getState())).toEqual(userData)
    expect(localStorage.getItem(KANBAN_STORAGE_KEY)).toBe(storedValue)
  })
})

describe('first-visit sample board', () => {
  beforeEach(() => {
    useKanbanStore.setState(createInitialKanbanState())
    localStorage.clear()
  })

  it('keeps_the_sample_board_when_nothing_is_persisted', async () => {
    const sampleState = pickPortableState(useKanbanStore.getState())

    await useKanbanStore.persist.rehydrate()

    expect(pickPortableState(useKanbanStore.getState())).toEqual(sampleState)
  })

  it('restores_persisted_user_data_instead_of_the_sample_board', async () => {
    const userData = createKanbanFixture()
    localStorage.setItem(KANBAN_STORAGE_KEY, JSON.stringify({ state: userData, version: 1 }))

    await useKanbanStore.persist.rehydrate()

    expect(pickPortableState(useKanbanStore.getState())).toEqual(userData)
  })

  it('never_adds_sample_tasks_to_a_persisted_empty_board', async () => {
    const userData = createKanbanFixture()
    const emptyTasks = Object.fromEntries(
      userData.columnsByBoard[userData.activeBoardId].map((column) => [column.id, []]),
    )
    userData.tasksByBoard[userData.activeBoardId] = emptyTasks
    localStorage.setItem(KANBAN_STORAGE_KEY, JSON.stringify({ state: userData, version: 1 }))

    await useKanbanStore.persist.rehydrate()

    expect(useKanbanStore.getState().tasksByBoard).toEqual({ [userData.activeBoardId]: emptyTasks })
  })
})

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

    expect(migrated.boards?.[0]?.title).toBe('My board')
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
