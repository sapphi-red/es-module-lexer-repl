import { useEffect, useState } from 'preact/hooks'
import { isVersionLower } from './parseVersion'

export const useVersionList = () => {
  const [versions, setVersions] = useState<string[] | undefined>()

  useEffect(() => {
    const abort = new AbortController()
    ;(async () => {
      try {
        const res = await fetch(
          'https://data.jsdelivr.com/v1/package/npm/es-module-lexer',
          {
            signal: abort.signal
          }
        )
        const data: { versions: string[] } = await res.json()
        setVersions(
          data.versions.filter((version) => !isVersionLower(version, '0.5.0'))
        )
      } catch {
        /* ignore error */
      }
    })()
    return () => {
      abort.abort()
    }
  }, [])

  return versions
}
