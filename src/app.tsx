import { JSX } from 'preact'
import { useCallback } from 'preact/hooks'
import { Result } from './components/Result'
import { TextArea } from './components/TextArea'
import { VersionSelector } from './components/VersionSelector'
import { useQueryParam } from './components/useQueryParam'
import { useBase64Value } from './components/useBase64Value'

export function App() {
  const [version, setVersion] = useQueryParam('v', undefined)

  const [input, setInput] = useBase64Value(useQueryParam('input', ''), '')
  const onInput: JSX.GenericEventHandler<HTMLTextAreaElement> = useCallback(
    (e) => {
      const value = e.currentTarget.value
      setInput(value === '' ? null : value)
    },
    [setInput]
  )

  return (
    <div class="root">
      <header>
        <h1 class="title">es-module-lexer REPL</h1>
        <VersionSelector version={version} onSelectVersion={setVersion} />
      </header>
      <main>
        <div class="panel">
          <TextArea class="input" value={input} onInput={onInput} />
        </div>
        {version !== undefined ? (
          <Result version={version} input={input} />
        ) : undefined}
      </main>
    </div>
  )
}
