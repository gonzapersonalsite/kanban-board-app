import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  createKanbanSnapshot,
  MAX_BACKUP_FILE_SIZE_BYTES,
  parseBackupFile,
  serializeKanbanSnapshot,
} from '@/features/data-portability'
import { useKanbanStore } from '@/shared/api'
import { useToastStore } from '@/shared/ui'
import { createKanbanFixture } from '@/test/fixtures/kanbanFixtures'
import { resetPersistedKanbanStore } from '@/test/helpers/storeTestUtils'
import { DataImportSection } from './DataImportSection'

describe('DataImportSection', () => {
  it('reviews_a_valid_backup_and_shows_a_summary_before_importing', async () => {
    resetPersistedKanbanStore(useKanbanStore.setState)
    useToastStore.setState({ notifications: [] })

    const snapshot = createKanbanSnapshot(createKanbanFixture(), '2026-07-01T12:00:00.000Z')
    const file = new File([serializeKanbanSnapshot(snapshot)], 'backup.json', {
      type: 'application/json',
    })

    render(<DataImportSection />)

    fireEvent.change(screen.getByLabelText(/select backup file/i), {
      target: { files: [file] },
    })
    fireEvent.click(screen.getByRole('button', { name: /review backup/i }))

    expect(await screen.findByText('Backup summary')).toBeInTheDocument()
    expect(screen.getByText('backup.json')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(
      useToastStore.getState().notifications.at(-1)?.message,
    ).toBe('Backup reviewed. Confirm to replace current data.')
  })

  it('shows_a_validation_error_when_the_selected_file_is_invalid', async () => {
    resetPersistedKanbanStore(useKanbanStore.setState)
    useToastStore.setState({ notifications: [] })

    const file = new File(['not-json'], 'broken.json', {
      type: 'application/json',
    })

    render(<DataImportSection />)

    fireEvent.change(screen.getByLabelText(/select backup file/i), {
      target: { files: [file] },
    })
    fireEvent.click(screen.getByRole('button', { name: /review backup/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The selected file is not valid JSON.',
    )
    expect(useToastStore.getState().notifications.at(-1)?.message).toBe(
      'The selected file is not valid JSON.',
    )
  })

  it('imports_a_reviewed_backup_and_calls_the_completion_callback', async () => {
    resetPersistedKanbanStore(useKanbanStore.setState)
    useToastStore.setState({ notifications: [] })

    const onImportComplete = vi.fn()
    const snapshot = {
      schemaVersion: 1 as const,
      exportedAt: '2026-07-01T12:00:00.000Z',
      boards: [{ id: 'board-imported', title: 'Imported Board' }],
      activeBoardId: 'board-imported',
      columnsByBoard: {
        'board-imported': [{ id: 'col-imported', title: 'Imported Column' }],
      },
      tasksByBoard: {
        'board-imported': {
          'col-imported': [
            { id: 'task-imported', title: 'Imported Task', description: 'From backup' },
          ],
        },
      },
    }
    const file = new File([JSON.stringify(snapshot)], 'backup.json', {
      type: 'application/json',
    })

    render(<DataImportSection onImportComplete={onImportComplete} />)

    fireEvent.change(screen.getByLabelText(/select backup file/i), {
      target: { files: [file] },
    })
    fireEvent.click(screen.getByRole('button', { name: /review backup/i }))

    expect(await screen.findByText('Backup summary')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /import and replace/i }))

    await waitFor(() => {
      expect(onImportComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          activeBoardId: 'board-imported',
        }),
      )
    })

    expect(useKanbanStore.getState().activeBoardId).toBe('board-imported')
    expect(useKanbanStore.getState().boards[0]?.title).toBe('Imported Board')
    expect(useToastStore.getState().notifications.at(-1)?.message).toBe('Backup imported')
  })

  it('cancels_a_reviewed_import_without_mutating_the_store', async () => {
    resetPersistedKanbanStore(useKanbanStore.setState)
    useToastStore.setState({ notifications: [] })

    const previousState = structuredClone({
      boards: useKanbanStore.getState().boards,
      activeBoardId: useKanbanStore.getState().activeBoardId,
      columnsByBoard: useKanbanStore.getState().columnsByBoard,
      tasksByBoard: useKanbanStore.getState().tasksByBoard,
    })
    const snapshot = createKanbanSnapshot(createKanbanFixture(), '2026-07-01T12:00:00.000Z')
    const file = new File([serializeKanbanSnapshot(snapshot)], 'backup.json', {
      type: 'application/json',
    })

    render(<DataImportSection />)

    fireEvent.change(screen.getByLabelText(/select backup file/i), {
      target: { files: [file] },
    })
    fireEvent.click(screen.getByRole('button', { name: /review backup/i }))

    expect(await screen.findByText('Backup summary')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }))

    expect(screen.queryByText('Backup summary')).not.toBeInTheDocument()
    expect({
      boards: useKanbanStore.getState().boards,
      activeBoardId: useKanbanStore.getState().activeBoardId,
      columnsByBoard: useKanbanStore.getState().columnsByBoard,
      tasksByBoard: useKanbanStore.getState().tasksByBoard,
    }).toEqual(previousState)
    expect(useToastStore.getState().notifications.at(-1)?.message).toBe('Import cancelled')
  })

  it('rejects_backup_files_that_are_too_large_before_reading_them', async () => {
    const oversizedFile = {
      size: MAX_BACKUP_FILE_SIZE_BYTES + 1,
      text: vi.fn(),
      name: 'huge-backup.json',
    } as unknown as File

    await expect(parseBackupFile(oversizedFile)).rejects.toMatchObject({
      name: 'BackupFileError',
      code: 'file_too_large',
    })
    expect(oversizedFile.text).not.toHaveBeenCalled()
  })

  it('shows_a_validation_error_when_the_backup_file_cannot_be_read', async () => {
    resetPersistedKanbanStore(useKanbanStore.setState)
    useToastStore.setState({ notifications: [] })

    const unreadableFile = {
      name: 'unreadable.json',
      size: 128,
      text: vi.fn(() => Promise.reject(new Error('read failed'))),
    } as unknown as File

    render(<DataImportSection />)

    fireEvent.change(screen.getByLabelText(/select backup file/i), {
      target: { files: [unreadableFile] },
    })
    fireEvent.click(screen.getByRole('button', { name: /review backup/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The selected backup file could not be read.',
    )
    expect(useToastStore.getState().notifications.at(-1)?.message).toBe(
      'The selected backup file could not be read.',
    )
  })
})
