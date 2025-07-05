import { useCallback, useEffect, useMemo, useState } from 'preact/hooks'

const listeners: (() => void)[] = []

const useQueryParams = () => {
  const [ourSearch, setOurSearch] = useState(location.search)

  useEffect(() => {
    const onChange = () => {
      setOurSearch(location.search)
    }

    window.addEventListener('popstate', onChange)
    listeners.push(onChange)
    return () => {
      window.removeEventListener('popstate', onChange)
      listeners.splice(listeners.indexOf(onChange), 1)
    }
  }, [])

  const setBrowserSearch = (search: string) => {
    const newUrl = new URL(location.href)
    newUrl.search = search
    window.history.replaceState(null, '', newUrl.href)
    listeners.forEach((listener) => {
      listener()
    })
  }

  return [ourSearch, setBrowserSearch] as const
}

export const useQueryParam = <T extends string | undefined>(
  key: string,
  defaultValue: T
) => {
  const [q, setQ] = useQueryParams()

  const singleValue = useMemo(
    () => new URLSearchParams(q).get(key) ?? defaultValue,
    [q, key, defaultValue]
  )
  const setSingleValue = useCallback((value: string | null) => {
    const params = new URLSearchParams(q)
    if (value === null) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    setQ(params.toString())
  }, [q, setQ, key])

  return [singleValue, setSingleValue] as const
}
