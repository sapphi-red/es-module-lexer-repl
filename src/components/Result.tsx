import { useMemo } from 'preact/hooks'
import { ResultCode } from './ResultCode'
import { usePackage } from './usePackage'

export const Result = ({
  version,
  input
}: {
  version: string
  input: string
}) => {
  const esModuleLexer = usePackage(version)

  const result = useMemo(() => {
    if (esModuleLexer === undefined) return { type: 'loading' } as const

    try {
      return { type: 'success', value: esModuleLexer.parse(input) } as const
    } catch (e) {
      return { type: 'error', value: e } as const
    }
  }, [esModuleLexer, input])

  return (
    <div class="result">
      {result.type === 'loading' ? 'loading...' : null}
      {result.type === 'success' ? (
        <>
          <div>facade: {JSON.stringify(result.value[2])}</div>
          <div class="panel">
            <ResultCode source={input} result={result.value} version={version} />
          </div>
        </>
      ) : null}
      {result.type === 'error' ? <div class="result-error">{`${result.value}`}</div> : null}
    </div>
  )
}
