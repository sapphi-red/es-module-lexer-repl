import { useEffect, useState } from 'preact/hooks'
import type * as EsModuleLexer from 'es-module-lexer'

export const usePackage = (version: string) => {
  const [esModuleLexer, setEsModuleLexer] = useState<
    typeof EsModuleLexer | undefined
  >()

  useEffect(() => {
    const abort = new AbortController()
    const url = `https://cdn.jsdelivr.net/npm/es-module-lexer@${version}/dist/lexer.js`

    ;(async () => {
      setEsModuleLexer(undefined)
      const mod: typeof EsModuleLexer = await import(/* @vite-ignore */ url)
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
