import styles from './searchResults.module.css'

interface Payload {
    code: string
    name: string
}

interface Result {
    id: string
    payload: Payload
}

interface SearchResultsProps {
    results: Result[]
}

export default function SearchResults({ results }: SearchResultsProps) {
    return (
        <ul className={styles.results}>
            {results.map(({ id, payload }) => (
                <li className={styles.result} key={id}>
                    {/* <Link href="/posts/[id]" as={`/posts/${id}`}>
                <a>{title}</a>
              </Link> */}
                    <p>{`Code: ${payload["code"]}`}</p>
                    <p>{`Name: ${payload["name"]}`}</p>
                </li>
            ))}
        </ul>
    )
}