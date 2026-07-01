import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { HomePage } from './HomePage'
import { useKanbanStore } from '@/shared/api'
import { resetPersistedKanbanStore } from '@/test/helpers/storeTestUtils'
import { BOARD_MAIN_ID } from '@/test/fixtures/kanbanFixtures'

describe('HomePage', () => {
  it('renders_header_and_board_on_a_board_route', () => {
    resetPersistedKanbanStore(useKanbanStore.setState)

    render(
      <MemoryRouter initialEntries={[`/board/${BOARD_MAIN_ID}`]}>
        <Routes>
          <Route path="/board/:boardId" element={<HomePage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('combobox', { name: /switch board/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /board/i })).toHaveAttribute(
      'href',
      `/board/${BOARD_MAIN_ID}`,
    )
    expect(screen.getByRole('link', { name: /calendar/i })).toHaveAttribute(
      'href',
      `/calendar/${BOARD_MAIN_ID}`,
    )
  })
})
