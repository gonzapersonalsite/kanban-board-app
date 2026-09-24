import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { useKanbanStore } from '@/shared/api'
import { BoardDndContext } from './BoardDndContext'
import { DraggableTaskCard } from './DraggableTaskCard'

const KANBAN_STORAGE_KEY = 'kanban-board-storage'

// Renders the real @dnd-kit provider over the untouched first-visit sample board. This file
// never changes the locale: a locale change while the board is not the untouched sample would
// end the sample lifecycle for the whole module.
function renderFirstSampleTask() {
  const state = useKanbanStore.getState()
  const boardId = state.activeBoardId!
  const [firstColumn] = state.columnsByBoard[boardId]
  const [firstTask] = state.tasksByBoard[boardId][firstColumn.id]

  const { container } = render(
    <BoardDndContext>
      <DraggableTaskCard
        task={firstTask}
        columnId={firstColumn.id}
        index={0}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    </BoardDndContext>,
  )

  return container.querySelector<HTMLElement>('[aria-describedby="board-dnd-instructions"]')!
}

describe('BoardDndContext with the untouched sample board', () => {
  beforeAll(() => {
    // jsdom lacks the browser APIs @dnd-kit uses once a drag starts.
    class NoopObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
    }
    document.getAnimations ??= () => []
    Element.prototype.getAnimations ??= () => []
    // The drop animation runs on the Web Animations API, which jsdom does not implement.
    Element.prototype.animate ??= () => ({ finished: Promise.resolve() }) as unknown as Animation
    vi.stubGlobal('IntersectionObserver', NoopObserver)
    vi.stubGlobal('ResizeObserver', NoopObserver)
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      addEventListener() {},
      removeEventListener() {},
    }))
  })

  afterAll(() => {
    vi.unstubAllGlobals()
  })

  beforeEach(() => {
    useKanbanStore.setState(useKanbanStore.getInitialState())
    localStorage.clear()
  })

  it('keeps_the_sample_board_unsaved_when_a_keyboard_pick_up_is_canceled', async () => {
    const activator = renderFirstSampleTask()
    await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument())

    fireEvent.keyDown(activator, { code: 'Space', key: ' ' })
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/^Picked up task/))
    fireEvent.keyDown(activator, { code: 'Escape', key: 'Escape' })
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/^Move cancelled/))

    expect(localStorage.getItem(KANBAN_STORAGE_KEY)).toBeNull()
  })

  it('keeps_the_sample_board_unsaved_when_a_card_is_dropped_where_it_was_picked_up', async () => {
    const activator = renderFirstSampleTask()
    await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument())

    fireEvent.keyDown(activator, { code: 'Space', key: ' ' })
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/^Picked up task/))
    fireEvent.keyDown(activator, { code: 'Space', key: ' ' })
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/was dropped/))

    expect(localStorage.getItem(KANBAN_STORAGE_KEY)).toBeNull()
  })
})
