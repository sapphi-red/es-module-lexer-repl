import { JSX } from 'preact'
import { useVersionList } from './useVersionList'
import { useCallback, useEffect } from 'preact/hooks'

export const VersionSelector = ({
  version,
  onSelectVersion
}: {
  version: string | undefined
  onSelectVersion: (version: string) => void
}) => {
  const versionList = useVersionList()

  const onInput: JSX.GenericEventHandler<HTMLSelectElement> = useCallback(
    (e) => {
      onSelectVersion(e.currentTarget.value)
    },
    [onSelectVersion]
  )
  useEffect(() => {
    if (version === undefined && versionList !== undefined) {
      onSelectVersion(versionList[0])
    }
  }, [version, versionList, onSelectVersion])

  return (
    <label class="version-selector">
      <span class="version-selector-label">Version</span>
      <select class="version-selector-inner" value={version} onInput={onInput}>
        {versionList?.map((ver) => (
          <option>{ver}</option>
        ))}
      </select>
    </label>
  )
}
