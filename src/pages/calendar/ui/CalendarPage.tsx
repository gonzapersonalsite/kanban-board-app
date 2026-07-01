import { CalendarGrid } from '@/widgets/calendar'
import { useTaskDialog, TaskDialog } from '@/features/task-management'
import type { Task, ColumnId } from '@/shared/api'
import styles from './CalendarPage.module.css'

export function CalendarPage() {
  const dialog = useTaskDialog()

  const handleTaskClick = (task: Task, columnId: ColumnId) => {
    dialog.openForEdit(task, columnId)
  }

  return (
    <div className={styles.page}>
      <CalendarGrid onTaskClick={handleTaskClick} />
      {dialog.isOpen && (
        <TaskDialog
          open={dialog.isOpen}
          onClose={dialog.close}
          onSave={dialog.handleSave}
          initialTitle={dialog.editingTask?.title}
          initialDescription={dialog.editingTask?.description}
          initialDueDate={dialog.editingTask?.dueDate}
        />
      )}
    </div>
  )
}
