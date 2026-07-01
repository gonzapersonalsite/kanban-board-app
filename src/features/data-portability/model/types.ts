import type { PortableKanbanState } from '@/shared/api'

export const KANBAN_SNAPSHOT_SCHEMA_VERSION = 1 as const

export interface KanbanSnapshotV1 extends PortableKanbanState {
  schemaVersion: typeof KANBAN_SNAPSHOT_SCHEMA_VERSION
  exportedAt: string
}

export type KanbanSnapshot = KanbanSnapshotV1

export type KanbanSnapshotErrorCode =
  | 'invalid_json'
  | 'unsupported_schema_version'
  | 'invalid_snapshot'

export class KanbanSnapshotError extends Error {
  readonly code: KanbanSnapshotErrorCode

  constructor(code: KanbanSnapshotErrorCode, message: string) {
    super(message)
    this.name = 'KanbanSnapshotError'
    this.code = code
  }
}
