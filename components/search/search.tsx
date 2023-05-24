'use client'

import React, { useCallback, useState, useEffect } from 'react'
import styles from './search.module.css'
import Results from './results'
import Spinner from './spinner'

export default function Search() {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState([])

  const searchEndpoint = (query: string) => `/api/search?collection=cs-courses&q=${query}`

  const onChange = useCallback((event: React.FormEvent<HTMLInputElement>) => {
    const query = event.currentTarget.value;
    setQuery(query)
  }, [])

  const submitQuery = useCallback(() => {
    if (query.length) {
      setResults([])
      setIsLoading(true)
      fetch(searchEndpoint(query))
        .then(res => res.json())
        .then(res => {
          setIsLoading(false)
          setResults(res.results)
        })
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
        placeholder='Search courses'
        type='text'
        value={query}
      />
      {isLoading && <Spinner />}
      {results.length > 0 && <Results results={results} />}
    </div>
  )
}