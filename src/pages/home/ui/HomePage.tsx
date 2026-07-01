import { Board } from '@/widgets/board'
import styles from './HomePage.module.css'

export function HomePage() {
  return (
    <div className={styles.page}>
      <Board />
    </div>
  )
}
