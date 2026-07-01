import { act, fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BoardManagement } from './BoardManagement'
import { renderWithKanban } from '@/test/helpers/renderWithKanban'
import { useKanbanStore } from '@/shared/api'
import { BOARD_MAIN_ID } from '@/test/fixtures/kanbanFixtures'
import { useI18nStore } from '@/shared/i18n'

describe('BoardManagement', () => {
  it('creates_a_new_board_from_the_dialog', () => {
    useI18nStore.getState().setLocale('en')
    renderWithKanban(<BoardManagement />)

    fireEvent.click(screen.getByRole('button', { name: /new board/i }))
    fireEvent.change(screen.getByPlaceholderText('Board name...'), {
      target: { value: 'Planning' },
    })
    fireEvent.click(screen.getByRole('button', { name: /^create$/i }))

    expect(useKanbanStore.getState().boards.some((board) => board.title === 'Planning')).toBe(
      true,
    )
    expect(useKanbanStore.getState().activeBoardId).toBe(
      useKanbanStore.getState().boards.find((board) => board.title === 'Planning')?.id,
    )
  })

  it('shows_an_inline_error_and_keeps_the_dialog_open_when_creating_without_title', () => {
    useI18nStore.getState().setLocale('es')
    renderWithKanban(<BoardManagement />)
    const before = useKanbanStore.getState().boards.length

    fireEvent.click(screen.getByRole('button', { name: /nuevo tablero/i }))
    fireEvent.click(screen.getByRole('button', { name: /^crear$/i }))

    expect(useKanbanStore.getState().boards).toHaveLength(before)
    expect(screen.getByRole('alert')).toHaveTextContent('El título no puede estar vacío')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('renames_the_active_board_from_the_dialog', () => {
    useI18nStore.getState().setLocale('en')
    renderWithKanban(<BoardManagement />)

    fireEvent.click(screen.getByRole('button', { name: /rename board/i }))
    fireEvent.change(screen.getByPlaceholderText('Board name...'), {
      target: { value: 'Roadmap' },
    })
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }))

    expect(useKanbanStore.getState().boards[0]?.title).toBe('Roadmap')
  })

  it('deletes_the_active_board_after_confirmation', () => {
    useI18nStore.getState().setLocale('en')
    renderWithKanban(<BoardManagement />)

    act(() => {
      useKanbanStore.getState().addBoard('Secondary')
    })
    const secondaryBoardId = useKanbanStore
      .getState()
      .boards.find((board) => board.title === 'Secondary')!.id

    fireEvent.click(screen.getByRole('button', { name: /delete board/i }))
    fireEvent.click(screen.getByRole('button', { name: /^delete$/i }))

    expect(useKanbanStore.getState().boards.some((board) => board.id === secondaryBoardId)).toBe(
      false,
    )
    expect(useKanbanStore.getState().activeBoardId).toBe(BOARD_MAIN_ID)
  })
})
