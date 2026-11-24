import { act, fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BoardSelector } from './BoardSelector'
import { renderWithKanban } from '@/test/helpers/renderWithKanban'
import { useKanbanStore } from '@/shared/api'
import { BOARD_MAIN_ID } from '@/test/fixtures/kanbanFixtures'
import { useI18nStore } from '@/shared/i18n'

describe('BoardSelector', () => {
  it('renders_the_current_board_in_the_select', () => {
    useI18nStore.getState().setLocale('en')
    renderWithKanban(
      <BoardSelector
        boards={useKanbanStore.getState().boards}
        activeBoardId={useKanbanStore.getState().activeBoardId}
        onBoardChange={() => {}}
      />,
    )

    expect(screen.getByRole('combobox', { name: /switch board/i })).toBeInTheDocument()
    expect(screen.getByDisplayValue('My board')).toBeInTheDocument()
  })

  it('switches_the_active_board_when_a_different_option_is_selected', () => {
    useI18nStore.getState().setLocale('en')
    const { rerender } = renderWithKanban(
      <BoardSelector
        boards={useKanbanStore.getState().boards}
        activeBoardId={useKanbanStore.getState().activeBoardId}
        onBoardChange={(boardId) => useKanbanStore.getState().setActiveBoard(boardId)}
      />,
    )

    act(() => {
      useKanbanStore.getState().addBoard('Secondary')
      useKanbanStore.getState().setActiveBoard(BOARD_MAIN_ID)
    })

    rerender(
      <BoardSelector
        boards={useKanbanStore.getState().boards}
        activeBoardId={useKanbanStore.getState().activeBoardId}
        onBoardChange={(boardId) => useKanbanStore.getState().setActiveBoard(boardId)}
      />,
    )

    const secondaryBoardId = useKanbanStore.getState().boards.find((board) => board.title === 'Secondary')!.id

    fireEvent.change(screen.getByRole('combobox', { name: /switch board/i }), {
      target: { value: secondaryBoardId },
    })

    expect(useKanbanStore.getState().activeBoardId).toBe(secondaryBoardId)
  })

  it('labels_each_select_with_its_own_label_when_two_selectors_share_a_page', () => {
    useI18nStore.getState().setLocale('en')
    renderWithKanban(
      <>
        <BoardSelector
          boards={useKanbanStore.getState().boards}
          activeBoardId={useKanbanStore.getState().activeBoardId}
          onBoardChange={() => {}}
        />
        <BoardSelector
          boards={useKanbanStore.getState().boards}
          activeBoardId={useKanbanStore.getState().activeBoardId}
          onBoardChange={() => {}}
        />
      </>,
    )

    const selects = screen.getAllByRole<HTMLSelectElement>('combobox', { name: /switch board/i })

    expect(selects.map((select) => select.labels.length)).toEqual([1, 1])
  })
})
