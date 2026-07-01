import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AppRouter } from './AppRouter'

describe('AppRouter', () => {
  it('renders_home_page_on_root_route', async () => {
    render(<AppRouter />)

    await waitFor(() => {
      expect(screen.getByText('Kanban Board')).toBeInTheDocument()
    })
  })
})
