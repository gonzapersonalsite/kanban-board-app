import { describe, expect, it } from 'vitest'
import { createKanbanFixture } from '@/test/fixtures/kanbanFixtures'
import {
  createKanbanSnapshot,
  deserializeKanbanSnapshot,
  normalizeKanbanSnapshot,
  serializeKanbanSnapshot,
} from './snapshot'
import {
  KANBAN_SNAPSHOT_SCHEMA_VERSION,
  KanbanSnapshotError,
} from './types'

describe('kanban snapshot contract', () => {
  it('creates_versioned_snapshot_from_portable_state', () => {
    const fixture = createKanbanFixture()
    const exportedAt = '2026-07-01T12:00:00.000Z'

    const snapshot = createKanbanSnapshot(fixture, exportedAt)

    fixture.boards[0].title = 'Changed after export'
    fixture.columnsByBoard[fixture.activeBoardId][0].title = 'Changed column'

    expect(snapshot).toEqual({
      schemaVersion: KANBAN_SNAPSHOT_SCHEMA_VERSION,
      exportedAt,
      boards: [{ id: 'board-main', title: 'My Board' }],
      activeBoardId: 'board-main',
      columnsByBoard: {
        'board-main': [
          { id: 'col-todo', title: 'To Do' },
          { id: 'col-progress', title: 'In Progress' },
          { id: 'col-done', title: 'Done' },
        ],
      },
      tasksByBoard: {
        'board-main': {
          'col-todo': [
            {
              id: 'task-alpha',
              title: 'Alpha',
              description: 'First task',
              dueDate: '2026-07-15',
            },
            {
              id: 'task-beta',
              title: 'Beta',
              description: '',
            },
          ],
          'col-progress': [
            {
              id: 'task-gamma',
              title: 'Gamma',
              description: 'In progress',
            },
          ],
          'col-done': [],
        },
      },
    })
  })

  it('serializes_and_deserializes_snapshot_roundtrip', () => {
    const fixture = createKanbanFixture()
    const snapshot = createKanbanSnapshot(fixture, '2026-07-01T12:00:00.000Z')

    const serialized = serializeKanbanSnapshot(snapshot)
    const restored = deserializeKanbanSnapshot(serialized)

    expect(restored).toEqual(snapshot)
  })

  it('normalizes_missing_board_maps_and_unknown_task_columns', () => {
    const snapshot = normalizeKanbanSnapshot({
      schemaVersion: 1,
      exportedAt: '2026-07-01T12:00:00.000Z',
      boards: [{ id: 'board-1', title: '  Board 1  ' }],
      activeBoardId: 'board-1',
      columnsByBoard: {
        'board-1': [{ id: 'col-1', title: '  Todo  ' }],
      },
      tasksByBoard: {
        'board-1': {
          'col-1': [
            {
              id: 'task-1',
              title: '  Task  ',
              description: 'Snapshot task',
              dueDate: '   ',
            },
          ],
          orphaned: [
            {
              id: 'task-orphan',
              title: 'Ghost',
              description: '',
            },
          ],
        },
      },
    })

    expect(snapshot).toEqual({
      schemaVersion: 1,
      exportedAt: '2026-07-01T12:00:00.000Z',
      boards: [{ id: 'board-1', title: 'Board 1' }],
      activeBoardId: 'board-1',
      columnsByBoard: {
        'board-1': [{ id: 'col-1', title: 'Todo' }],
      },
      tasksByBoard: {
        'board-1': {
          'col-1': [
            {
              id: 'task-1',
              title: 'Task',
              description: 'Snapshot task',
            },
          ],
        },
      },
    })

    const normalizedWithMissingMaps = normalizeKanbanSnapshot({
      schemaVersion: 1,
      exportedAt: '2026-07-01T12:00:00.000Z',
      boards: [{ id: 'board-2', title: 'Board 2' }],
      activeBoardId: 'board-2',
      columnsByBoard: {},
      tasksByBoard: {},
    })

    expect(normalizedWithMissingMaps.columnsByBoard['board-2']).toEqual([])
    expect(normalizedWithMissingMaps.tasksByBoard['board-2']).toEqual({})
  })

  it('throws_invalid_json_when_payload_is_not_json', () => {
    expect(() => deserializeKanbanSnapshot('not-json')).toThrowError(
      new KanbanSnapshotError('invalid_json', 'Snapshot content is not valid JSON.'),
    )
  })

  it('throws_unsupported_schema_version_when_version_is_unknown', () => {
    expect(() =>
      normalizeKanbanSnapshot({
        schemaVersion: 2,
        exportedAt: '2026-07-01T12:00:00.000Z',
        boards: [{ id: 'board-1', title: 'Board 1' }],
        activeBoardId: 'board-1',
        columnsByBoard: {},
        tasksByBoard: {},
      }),
    ).toThrowError(
      new KanbanSnapshotError(
        'unsupported_schema_version',
        'Unsupported snapshot schema version: 2',
      ),
    )
  })

  it('throws_invalid_snapshot_when_active_board_does_not_exist', () => {
    expect(() =>
      normalizeKanbanSnapshot({
        schemaVersion: 1,
        exportedAt: '2026-07-01T12:00:00.000Z',
        boards: [{ id: 'board-1', title: 'Board 1' }],
        activeBoardId: 'missing-board',
        columnsByBoard: {},
        tasksByBoard: {},
      }),
    ).toThrowError(
      new KanbanSnapshotError(
        'invalid_snapshot',
        'Restore state activeBoardId "missing-board" does not exist in boards.',
      ),
    )
  })
})
