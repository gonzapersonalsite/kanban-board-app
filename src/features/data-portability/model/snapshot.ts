import { KanbanRestoreError, normalizePortableKanbanState } from '@/shared/api'
import {
  KANBAN_SNAPSHOT_SCHEMA_VERSION,
  KanbanSnapshotError,
  type KanbanSnapshot,
  type PortableKanbanState,
} from './types'

export function createKanbanSnapshot(
  state: PortableKanbanState,
  exportedAt = new Date().toISOString(),
): KanbanSnapshot {
  return normalizeKanbanSnapshot({
    schemaVersion: KANBAN_SNAPSHOT_SCHEMA_VERSION,
    exportedAt,
    boards: state.boards,
    activeBoardId: state.activeBoardId,
    columnsByBoard: state.columnsByBoard,
    tasksByBoard: state.tasksByBoard,
  })
}

export function serializeKanbanSnapshot(snapshot: KanbanSnapshot): string {
  return JSON.stringify(normalizeKanbanSnapshot(snapshot), null, 2)
}

export function deserializeKanbanSnapshot(serialized: string): KanbanSnapshot {
  try {
    return normalizeKanbanSnapshot(JSON.parse(serialized) as unknown)
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new KanbanSnapshotError('invalid_json', 'Snapshot content is not valid JSON.')
    }

    throw error
  }
}

export function normalizeKanbanSnapshot(input: unknown): KanbanSnapshot {
  const candidate = toRecord(input, 'Snapshot root must be an object.')
  const schemaVersion = normalizeSchemaVersion(candidate.schemaVersion)
  const exportedAt = normalizeExportedAt(candidate.exportedAt)

  try {
    const portableState = normalizePortableKanbanState(candidate)

    return {
      schemaVersion,
      exportedAt,
      ...portableState,
    }
  } catch (error) {
    if (error instanceof KanbanRestoreError) {
      throw new KanbanSnapshotError('invalid_snapshot', error.message)
    }

    throw error
  }
}

function normalizeSchemaVersion(value: unknown): typeof KANBAN_SNAPSHOT_SCHEMA_VERSION {
  if (value !== KANBAN_SNAPSHOT_SCHEMA_VERSION) {
    throw new KanbanSnapshotError(
      'unsupported_schema_version',
      `Unsupported snapshot schema version: ${String(value)}`,
    )
  }

  return KANBAN_SNAPSHOT_SCHEMA_VERSION
}

function normalizeExportedAt(value: unknown): string {
  const exportedAt = normalizeNonEmptyString(value, 'Snapshot exportedAt must be a string.')
  if (Number.isNaN(Date.parse(exportedAt))) {
    throw new KanbanSnapshotError(
      'invalid_snapshot',
      'Snapshot exportedAt must be a valid ISO date string.',
    )
  }

  return exportedAt
}

function normalizeNonEmptyString(value: unknown, message: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new KanbanSnapshotError('invalid_snapshot', message)
  }

  return value.trim()
}

function toRecord(value: unknown, message: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new KanbanSnapshotError('invalid_snapshot', message)
  }

  return value as Record<string, unknown>
}
