import { Header } from '@/widgets/header'
import { Board } from '@/widgets/board'
import styles from './HomePage.module.css'

export function HomePage() {
  return (
    <div className={styles.page}>
      <Header />
      <Board />
    </div>
  )
}
