import { useEffect, useState } from 'preact/hooks'
import type * as EsModuleLexer from 'es-module-lexer'

export const usePackage = (version: string) => {
  const [esModuleLexer, setEsModuleLexer] = useState<
    typeof EsModuleLexer | undefined
  >()

  useEffect(() => {
    const abort = new AbortController()
    const url = `https://cdn.jsdelivr.net/npm/es-module-lexer@${version}/dist/lexer.js`

    void (async () => {
      setEsModuleLexer(undefined)
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
      const mod = (await import(/* @vite-ignore */ url)) as typeof EsModuleLexer
      if (abort.signal.aborted) return
      await mod.init
      if (abort.signal.aborted) return
      setEsModuleLexer(mod)
    })()

    return () => {
      abort.abort()
    }
  }, [version])

  return esModuleLexer
}
