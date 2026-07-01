import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Header } from './Header'
import { useKanbanStore } from '@/shared/api'
import { createKanbanSnapshot, serializeKanbanSnapshot } from '@/features/data-portability'
import { resetPersistedKanbanStore } from '@/test/helpers/storeTestUtils'
import { BOARD_MAIN_ID, createKanbanFixture } from '@/test/fixtures/kanbanFixtures'

function LocationDisplay() {
  const location = useLocation()

  return <div>{location.pathname}</div>
}

describe('Header', () => {
  it('renders_board_selector_as_the_primary_header_element', () => {
    resetPersistedKanbanStore(useKanbanStore.setState)

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    )

    expect(screen.getByRole('combobox', { name: /switch board/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /new board/i })).toBeInTheDocument()
  })

  it('renders_nav_links_for_board_and_calendar', () => {
    resetPersistedKanbanStore(useKanbanStore.setState)

    render(
      <MemoryRouter initialEntries={[`/board/${BOARD_MAIN_ID}`]}>
        <Header />
      </MemoryRouter>,
    )

    const boardLink = screen.getByRole('link', { name: /board/i })
    expect(boardLink).toBeInTheDocument()
    expect(boardLink).toHaveAttribute('href', `/board/${BOARD_MAIN_ID}`)

    const calendarLink = screen.getByRole('link', { name: /calendar/i })
    expect(calendarLink).toBeInTheDocument()
    expect(calendarLink).toHaveAttribute('href', `/calendar/${BOARD_MAIN_ID}`)
  })

  it('highlights_board_link_when_on_board_route', () => {
    resetPersistedKanbanStore(useKanbanStore.setState)

    render(
      <MemoryRouter initialEntries={[`/board/${BOARD_MAIN_ID}`]}>
        <Header />
      </MemoryRouter>,
    )

    const boardLink = screen.getByRole('link', { name: /board/i })
    expect(boardLink.getAttribute('aria-current')).toBe('page')
  })

  it('highlights_calendar_link_when_on_calendar_route', () => {
    resetPersistedKanbanStore(useKanbanStore.setState)

    render(
      <MemoryRouter initialEntries={[`/calendar/${BOARD_MAIN_ID}`]}>
        <Header />
      </MemoryRouter>,
    )

    const calendarLink = screen.getByRole('link', { name: /calendar/i })
    expect(calendarLink.getAttribute('aria-current')).toBe('page')
  })

  it('updates_the_url_when_switching_boards_from_the_selector', () => {
    resetPersistedKanbanStore(useKanbanStore.setState)

    act(() => {
      useKanbanStore.getState().addBoard('Secondary')
      useKanbanStore.getState().setActiveBoard(BOARD_MAIN_ID)
    })

    const secondaryBoardId = useKanbanStore
      .getState()
      .boards.find((board) => board.title === 'Secondary')!.id

    render(
      <MemoryRouter initialEntries={[`/calendar/${BOARD_MAIN_ID}`]}>
        <Routes>
          <Route
            path="/calendar/:boardId"
            element={
              <>
                <Header />
                <LocationDisplay />
              </>
            }
          />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByRole('combobox', { name: /switch board/i }), {
      target: { value: secondaryBoardId },
    })

    expect(screen.getByText(`/calendar/${secondaryBoardId}`)).toBeInTheDocument()
  })

  it('opens_the_settings_dialog_with_preferences_and_export_actions', () => {
    resetPersistedKanbanStore(useKanbanStore.setState)

    render(
      <MemoryRouter initialEntries={[`/board/${BOARD_MAIN_ID}`]}>
        <Header />
      </MemoryRouter>,
    )

    fireEvent.click(
      screen.getByRole('button', { name: /settings/i }),
    )

    expect(screen.getByText('Theme')).toBeInTheDocument()
    expect(screen.getByText('Language')).toBeInTheDocument()
    expect(screen.getByText('Backup data')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /download backup/i })).toBeInTheDocument()
    expect(screen.getByText('Restore data')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /review backup/i })).toBeInTheDocument()
  })

  it('shows_a_tooltip_for_the_settings_button', () => {
    resetPersistedKanbanStore(useKanbanStore.setState)

    render(
      <MemoryRouter initialEntries={[`/board/${BOARD_MAIN_ID}`]}>
        <Header />
      </MemoryRouter>,
    )

    fireEvent.mouseEnter(
      screen.getByRole('button', { name: /settings/i }),
    )

    expect(screen.getByRole('tooltip')).toHaveTextContent('Settings')
  })

  it('navigates_to_the_restored_active_board_after_importing_a_backup', async () => {
    resetPersistedKanbanStore(useKanbanStore.setState)

    const snapshot = createKanbanSnapshot({
      ...createKanbanFixture(),
      boards: [{ id: 'board-restored', title: 'Restored Board' }],
      activeBoardId: 'board-restored',
      columnsByBoard: {
        'board-restored': [{ id: 'col-restored', title: 'Restored Column' }],
      },
      tasksByBoard: {
        'board-restored': {
          'col-restored': [
            { id: 'task-restored', title: 'Restored Task', description: 'From backup' },
          ],
        },
      },
    }, '2026-07-01T12:00:00.000Z')

    const file = new File([serializeKanbanSnapshot(snapshot)], 'backup.json', {
      type: 'application/json',
    })

    render(
      <MemoryRouter initialEntries={[`/calendar/${BOARD_MAIN_ID}`]}>
        <Routes>
          <Route
            path="/calendar/:boardId"
            element={
              <>
                <Header />
                <LocationDisplay />
              </>
            }
          />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: /settings/i }))
    fireEvent.change(screen.getByLabelText(/select backup file/i), {
      target: { files: [file] },
    })
    fireEvent.click(screen.getByRole('button', { name: /review backup/i }))

    expect(await screen.findByText('Backup summary')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /import and replace/i }))

    expect(await screen.findByText('/calendar/board-restored')).toBeInTheDocument()
  })

  it('keeps_the_settings_dialog_open_while_selecting_and_reviewing_a_backup_file', async () => {
    resetPersistedKanbanStore(useKanbanStore.setState)

    const snapshot = createKanbanSnapshot(createKanbanFixture(), '2026-07-01T12:00:00.000Z')
    const file = new File([serializeKanbanSnapshot(snapshot)], 'backup.json', {
      type: 'application/json',
    })

    render(
      <MemoryRouter initialEntries={[`/board/${BOARD_MAIN_ID}`]}>
        <Header />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: /settings/i }))
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(/select backup file/i), {
      target: { files: [file] },
    })

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /review backup/i }))

    expect(await screen.findByText('Backup summary')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
  })
})
