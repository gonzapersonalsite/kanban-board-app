import { useState, useCallback } from 'react'
import { useKanbanStore } from '@/shared/api'
import type { ColumnId, Task, TaskId } from '@/shared/api'

export function useTaskDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editingColumnId, setEditingColumnId] = useState<ColumnId | null>(null)

  const updateTask = useKanbanStore((state) => state.updateTask)
  const deleteTask = useKanbanStore((state) => state.deleteTask)

  const openForEdit = useCallback((task: Task, columnId: ColumnId) => {
    setEditingTask(task)
    setEditingColumnId(columnId)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setEditingTask(null)
    setEditingColumnId(null)
  }, [])

  const handleSave = useCallback(
    (title: string, description: string) => {
      if (!editingColumnId || !editingTask) return

      updateTask(editingColumnId, editingTask.id, { title, description })
      close()
    },
    [editingTask, editingColumnId, updateTask, close],
  )

  const handleDelete = useCallback(
    (columnId: ColumnId, taskId: TaskId) => {
      deleteTask(columnId, taskId)
    },
    [deleteTask],
  )

  return {
    isOpen,
    editingTask,
    editingColumnId,
    openForEdit,
    close,
    handleSave,
    handleDelete,
  } as const
}
