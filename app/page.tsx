import styles from './page.module.css'
import SearchBar from '@/components/searchBar/searchBar'

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.center}>
        <SearchBar />
      </div>
    </main>
  )
}
