import type { StoreApi } from 'zustand'
import type { PersistStorage } from 'zustand/middleware'
import { useI18nStore } from '@/shared/i18n'
import { localizeSampleBoard } from './slices/helpers'
import type { KanbanState, PortableKanbanState } from './slices/types'

type KanbanStorage = PersistStorage<Partial<KanbanState>>

function hasSameBoardData(state: Partial<KanbanState>, sample: PortableKanbanState): boolean {
  return (
    state.boards === sample.boards &&
    state.activeBoardId === sample.activeBoardId &&
    state.columnsByBoard === sample.columnsByBoard &&
    state.tasksByBoard === sample.tasksByBoard
  )
}

// The first-visit sample board (the store's pre-hydration state) is never written to
// storage and follows the UI locale until the visitor changes something. Store actions
// replace every collection they modify, so reference identity tells the untouched sample
// apart from user data: the first change is persisted as usual and, from then on, the
// board is user data that no locale change touches.
export function createSampleBoardLifecycle() {
  let untouchedSample: PortableKanbanState | null = null

  const isUntouchedSample = (state: Partial<KanbanState>) =>
    untouchedSample !== null && hasSameBoardData(state, untouchedSample)

  return {
    skipUntouchedSampleWrites(storage: KanbanStorage): KanbanStorage {
      return {
        ...storage,
        setItem: (name, value) => {
          if (!isUntouchedSample(value.state)) {
            return storage.setItem(name, value)
          }
        },
      }
    },

    followLocale(store: StoreApi<KanbanState>): () => void {
      const initialState = store.getInitialState()
      untouchedSample = hasSameBoardData(store.getState(), initialState) ? initialState : null

      return useI18nStore.subscribe((i18n, previous) => {
        if (i18n.locale === previous.locale || !untouchedSample) {
          return
        }

        if (!isUntouchedSample(store.getState())) {
          untouchedSample = null
          return
        }

        untouchedSample = localizeSampleBoard(untouchedSample)
        store.setState(untouchedSample)
      })
    },
  }
}
