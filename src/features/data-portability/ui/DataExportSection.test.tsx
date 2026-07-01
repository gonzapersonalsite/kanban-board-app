import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DataExportSection } from './DataExportSection'
import { useKanbanStore } from '@/shared/api'
import { useToastStore } from '@/shared/ui'
import { resetPersistedKanbanStore } from '@/test/helpers/storeTestUtils'

describe('DataExportSection', () => {
  beforeEach(() => {
    resetPersistedKanbanStore(useKanbanStore.setState)
    useToastStore.setState({ notifications: [] })
    Object.defineProperty(navigator, 'maxTouchPoints', {
      configurable: true,
      value: 0,
    })

    vi.stubGlobal(
      'URL',
      Object.assign(URL, {
        createObjectURL: vi.fn(() => 'blob:backup-file'),
        revokeObjectURL: vi.fn(),
      }),
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete (navigator as Navigator & { share?: unknown }).share
    delete (navigator as Navigator & { canShare?: unknown }).canShare
  })

  it('downloads_a_backup_and_shows_success_feedback', async () => {
    const anchorClickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})

    render(<DataExportSection />)

    fireEvent.click(screen.getByRole('button', { name: /download backup/i }))

    expect(anchorClickSpy).toHaveBeenCalledTimes(1)
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1)

    const createdFile = vi.mocked(URL.createObjectURL).mock.calls[0][0] as File

    expect(createdFile.name).toMatch(/^kanban-board-backup-.*\.json$/)
    expect(await createdFile.text()).toContain('"schemaVersion": 1')
    expect(useToastStore.getState().notifications.at(-1)?.message).toBe('Backup downloaded')

    await waitFor(() => {
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:backup-file')
    })
  })

  it('renders_share_action_only_when_file_share_is_supported', () => {
    Object.defineProperty(navigator, 'maxTouchPoints', {
      configurable: true,
      value: 1,
    })
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: vi.fn(),
    })
    Object.defineProperty(navigator, 'canShare', {
      configurable: true,
      value: vi.fn(() => true),
    })

    render(<DataExportSection />)

    expect(screen.getByRole('button', { name: /download backup/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /share backup/i })).toBeInTheDocument()
  })

  it('hides_share_action_on_desktop_even_if_the_browser_exposes_share_apis', () => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: vi.fn(),
    })
    Object.defineProperty(navigator, 'canShare', {
      configurable: true,
      value: vi.fn(() => true),
    })

    render(<DataExportSection />)

    expect(screen.getByRole('button', { name: /download backup/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /share backup/i })).not.toBeInTheDocument()
  })

  it('shares_a_backup_and_shows_success_feedback', async () => {
    const shareSpy = vi.fn(() => Promise.resolve())

    Object.defineProperty(navigator, 'maxTouchPoints', {
      configurable: true,
      value: 1,
    })
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: shareSpy,
    })
    Object.defineProperty(navigator, 'canShare', {
      configurable: true,
      value: vi.fn(() => true),
    })

    render(<DataExportSection />)

    fireEvent.click(screen.getByRole('button', { name: /share backup/i }))

    await waitFor(() => {
      expect(shareSpy).toHaveBeenCalledTimes(1)
    })

    const sharePayload = shareSpy.mock.calls[0][0] as { files: File[]; title: string; text: string }

    expect(sharePayload.title).toBe('Kanban backup')
    expect(sharePayload.files[0]?.name).toMatch(/^kanban-board-backup-.*\.json$/)
    expect(useToastStore.getState().notifications.at(-1)?.message).toBe('Backup shared')
  })
})
