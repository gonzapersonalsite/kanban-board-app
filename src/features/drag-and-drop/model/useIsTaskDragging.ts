import { useDragOperation } from '@dnd-kit/react'

export function useIsTaskDragging(): boolean {
  const { source } = useDragOperation()
  return source?.type === 'task'
}
