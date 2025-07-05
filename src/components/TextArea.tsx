import autosize from 'autosize'
import { JSX } from 'preact'
import { useEffect, useRef } from 'preact/hooks'

export const TextArea = (
  props: JSX.InputHTMLAttributes<HTMLTextAreaElement>,
) => {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (ref.current) {
      autosize(ref.current)
    }
  }, [])

  return <textarea {...props} ref={ref} />
}
