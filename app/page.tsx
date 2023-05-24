import styles from './page.module.css'
import Search from '@/components/search/search'

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.center}>
        <Search />
      </div>
    </main>
  )
}
