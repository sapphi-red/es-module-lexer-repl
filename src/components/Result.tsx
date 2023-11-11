import { useMemo } from 'preact/hooks'
import { ResultCode } from './ResultCode'
import { usePackage } from './usePackage'
import { isVersionLower } from './parseVersion'

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
  const hasModuleSyntax = useMemo(() => {
    if (result.type !== 'success') return undefined
    if (isVersionLower(version, '1.4.0')) return 'Not supported in this version'
    return JSON.stringify(result.value[3])
  }, [result, version])

  return (
    <div class="result">
      {result.type === 'loading' ? 'loading...' : null}
      {result.type === 'success' ? (
        <>
          <div class="result-meta">
            <p>
              <span class="result-meta-title">facade</span>:{' '}
              {JSON.stringify(result.value[2])}
            </p>
            <p>
              <span class="result-meta-title">hasModuleSyntax</span>:{' '}
              {hasModuleSyntax}
            </p>
          </div>
          <div class="panel">
            <ResultCode
              source={input}
              result={result.value}
              version={version}
            />
          </div>
        </>
      ) : null}
      {result.type === 'error' ? (
        <div class="result-error">{`${result.value}`}</div>
      ) : null}
    </div>
  )
}
