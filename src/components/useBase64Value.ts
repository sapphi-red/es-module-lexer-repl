import { useCallback, useMemo } from 'preact/hooks'

export const useBase64Value = (
  [value, setValue]: readonly [string, (v: string | null) => void],
  fallbackValue: string
) => {
  const parsedValue = useMemo(() => {
    try {
      return atob(value)
    } catch {
      return fallbackValue
    }
  }, [value, fallbackValue])
  const setParsedValue = useCallback(
    (v: string | null) => {
      setValue(v === null ? null : btoa(v))
    },
    [setValue]
  )
  return [parsedValue, setParsedValue] as const
}
