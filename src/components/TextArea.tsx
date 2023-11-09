import autosize from 'autosize'
import { JSX } from 'preact'
import { useEffect, useRef } from 'preact/hooks'

export const TextArea = (
  props: JSX.DetailedHTMLProps<
    JSX.HTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  >
) => {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (ref.current) {
      autosize(ref.current)
    }
  }, [])

  return <textarea {...props} ref={ref} />
}
