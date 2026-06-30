import { GripVertical } from 'lucide-react'
import {
  BoardDndContext,
  SortableColumn,
  DraggableTaskCard,
  useIsTaskDragging,
} from '@/features/drag-and-drop'
import { AddColumnForm } from '@/features/column-management'
import { AddTaskForm, TaskDialog } from '@/features/task-management'
import { ColumnHeader } from '@/entities/column'
import { useBoard } from '../model/useBoard'
import { EmptyColumnMessage } from './EmptyColumnMessage'
import styles from './Board.module.css'

function BoardContent() {
  const board = useBoard()
  const isTaskDragging = useIsTaskDragging()

  return (
    <>
      <div className={styles.board}>
        {board.columns.map((col, index) => (
          <SortableColumn key={col.id} columnId={col.id} index={index}>
            <div className={styles.columnHeaderArea}>
              <div className={styles.columnDragHandle} data-dnd-handle>
                <GripVertical size={16} />
              </div>
              <ColumnHeader
                column={col}
                onRename={(title) => board.handleRename(col.id, title)}
                onDelete={() => board.handleDeleteColumn(col.id)}
                canDelete={board.canDeleteColumn(col.id)}
              />
            </div>
            <div className={styles.taskList}>
              {board.getColumnTasks(col.id).map((task, taskIndex) => (
                <DraggableTaskCard
                  key={task.id}
                  task={task}
                  columnId={col.id}
                  index={taskIndex}
                  onEdit={() => board.taskDialog.openForEdit(task, col.id)}
                  onDelete={() =>
                    board.taskDialog.handleDelete(col.id, task.id)
                  }
                />
              ))}
              {!board.hasTasks(col.id) && !isTaskDragging && (
                <EmptyColumnMessage />
              )}
              <AddTaskForm columnId={col.id} />
            </div>
          </SortableColumn>
        ))}
        <AddColumnForm />
      </div>
      {board.taskDialog.isOpen && (
        <TaskDialog
          open={board.taskDialog.isOpen}
          onClose={board.taskDialog.close}
          onSave={board.taskDialog.handleSave}
          initialTitle={board.taskDialog.editingTask?.title}
          initialDescription={board.taskDialog.editingTask?.description}
        />
      )}
    </>
  )
}

export function Board() {
  return (
    <BoardDndContext>
      <BoardContent />
    </BoardDndContext>
  )
}
