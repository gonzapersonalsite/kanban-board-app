import { AppIcon } from '@/shared/ui'
import styles from './Header.module.css'

export function Header() {
  return (
    <header className={styles.header}>
      <AppIcon />
      <h1 className={styles.title}>Kanban Board</h1>
    </header>
  )
}
