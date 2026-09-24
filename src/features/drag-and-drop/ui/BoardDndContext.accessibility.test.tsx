import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { useI18nStore } from '@/shared/i18n'
import {
  COLUMN_TODO_ID,
  TASK_ALPHA_ID,
  fixtureTasks,
} from '@/test/fixtures/kanbanFixtures'
import { setupKanbanStore } from '@/test/setup/kanbanStoreSetup'
import { BoardDndContext } from './BoardDndContext'
import { DraggableTaskCard } from './DraggableTaskCard'

// Renders the real @dnd-kit provider (no mock) to prove its Accessibility plugin speaks
// through the localized board announcements and instructions.
function renderBoardWithAlpha() {
  const alpha = fixtureTasks[COLUMN_TODO_ID].find((task) => task.id === TASK_ALPHA_ID)!

  return render(
    <BoardDndContext>
      <DraggableTaskCard
        task={alpha}
        columnId={COLUMN_TODO_ID}
        index={0}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    </BoardDndContext>,
  )
}

function getCardActivator(container: HTMLElement): HTMLElement {
  return container.querySelector<HTMLElement>('[aria-describedby="board-dnd-instructions"]')!
}

describe('BoardDndContext accessibility', () => {
  setupKanbanStore()

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

  afterEach(() => {
    act(() => useI18nStore.getState().setLocale('en'))
  })

  it('describes_draggable_cards_with_localized_instructions', () => {
    act(() => useI18nStore.getState().setLocale('de'))

    const { container } = renderBoardWithAlpha()

    const activator = getCardActivator(container)
    expect(activator).toHaveAttribute('aria-roledescription', 'ziehbar')
    expect(activator).toHaveAccessibleDescription(
      expect.stringContaining('Drücke die Leertaste oder die Eingabetaste'),
    )
  })

  it('updates_the_instructions_when_the_locale_changes', () => {
    const { container } = renderBoardWithAlpha()

    act(() => useI18nStore.getState().setLocale('es'))

    const activator = getCardActivator(container)
    expect(activator).toHaveAttribute('aria-roledescription', 'arrastrable')
    expect(activator).toHaveAccessibleDescription(
      expect.stringContaining('Para coger una tarjeta o una columna'),
    )
  })

  it('announces_a_keyboard_pick_up_in_the_current_locale', async () => {
    act(() => useI18nStore.getState().setLocale('es'))
    const { container } = renderBoardWithAlpha()
    const activator = getCardActivator(container)
    await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument())

    fireEvent.keyDown(activator, { code: 'Space', key: ' ' })

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Has cogido la tarea "Alpha".'),
    )
  })
})
