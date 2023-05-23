'use client'

import React, { useCallback, useState, useEffect } from 'react'
import styles from './search.module.css'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  const searchEndpoint = (query: string) => `/api/search?q=${query}`

  const onChange = useCallback((event: React.FormEvent<HTMLInputElement>) => {
    const query = event.currentTarget.value;
    setQuery(query)
  }, [])

  const submitQuery = useCallback(() => {
    if (query.length) {
      fetch(searchEndpoint(query))
        .then(res => res.json())
        .then(res => {
          setResults(res.results)
        })
    } else {
      setResults([])
    }
  }, [query])

  const handleUserKeyPress = useCallback((event: KeyboardEvent) => {
    const { code } = event;
    if (code === "Enter") {
      submitQuery()
    }
  }, [submitQuery]);

  useEffect(() => {
    window.addEventListener("keydown", handleUserKeyPress);
    return () => {
      window.removeEventListener("keydown", handleUserKeyPress);
    };
  }, [handleUserKeyPress]);

  return (
    <div
      className={styles.container}
    >
      <input
        className={styles.search}
        onChange={onChange}
        placeholder='Search posts'
        type='text'
        value={query}
      />
      {results.length > 0 && (
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
      )}
    </div>
  )
}