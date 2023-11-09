import { ComponentChild, ComponentChildren, JSX } from 'preact'
import { useCallback, useMemo, useState } from 'preact/hooks'
import { ParseResult } from '../types'
import { createPortal } from 'preact/compat'
import { isVersionLower } from './parseVersion'

type RecordMeta =
  | { type: 'import-module-specifier'; value: string | undefined }
  | { type: 'import-statement'; importType: 'static' | 'dynamic' | 'meta' }
  | { type: 'import-assertion' }
  | { type: 'dynamic-import' }
  | { type: 'export-exported-name'; value: string | undefined }
  | { type: 'export-local-name'; value: string | undefined }
type Record = {
  start: number
  end: number
  value: RecordMeta[]
  children: Record[]
}

export const ResultCode = ({
  source,
  version,
  result
}: {
  source: string
  version: string
  result: ParseResult
}) => {
  const chunks = useMemo(() => {
    const records: Record[] = []
    const addRecord = (
      start: number,
      end: number,
      value: RecordMeta,
      targetRecords: Record[] = records
    ) => {
      const targetRecord = targetRecords.find(
        (record) => record.start <= start && end <= record.end
      )
      if (targetRecord) {
        if (targetRecord.start === start && targetRecord.end === end) {
          targetRecord.value.push(value)
        } else {
          addRecord(start, end, value, targetRecord.children)
        }
        return
      }

      const children = []
      const childrenIndices = []
      for (const [i, record] of targetRecords.entries()) {
        if (start <= record.start && record.end <= end) {
          children.push(record)
          childrenIndices.push(i)
        }
      }
      if (children.length > 0) {
        targetRecords.push({ start, end, value: [value], children })
        for (const [i, idx] of childrenIndices.entries()) {
          targetRecords.splice(idx - i, 1)
        }
      } else {
        targetRecords.push({ start, end, value: [value], children: [] })
      }
    }

    const getImportType = (d: number) => {
      if (d === -2) return 'meta'
      if (d === -1) return 'static'
      if (d >= 0) return 'dynamic'
      throw new Error(`Invalid d value ${d}`)
    }

    for (const imp of result[0]) {
      addRecord(imp.s, imp.e, {
        type: 'import-module-specifier',
        value: imp.n
      })
      addRecord(imp.ss, imp.se, {
        type: 'import-statement',
        importType: getImportType(imp.d)
      })
      if (imp.a >= 0) {
        addRecord(imp.a, imp.a, { type: 'import-assertion' })
      }
      if (imp.d >= 0) {
        addRecord(imp.d, imp.d, { type: 'dynamic-import' })
      }
    }

    if (!isVersionLower(version, '1.0.0')) {
      for (const exp of result[1]) {
        addRecord(exp.s, exp.e, { type: 'export-exported-name', value: exp.n })
        if (exp.ls >= 0) {
          addRecord(exp.ls, exp.le, { type: 'export-local-name', value: exp.ln })
        }
      }
    }

    const getSortedRecords = (records: Record[]): Record[] =>
      records
        .map((record) => ({
          ...record,
          children: getSortedRecords(record.children)
        }))
        .sort((a, b) => a.start - b.start)

    const sortedRecords = getSortedRecords(records)

    const getChunks = (
      records: Record[],
      start: number,
      end: number
    ): ComponentChild[] => {
      if (records.length === 0) {
        return [source.slice(start, end)]
      }

      const chunks = []
      let lastPos = start
      for (const { start, end, value, children } of records) {
        chunks.push(source.slice(lastPos, start))
        chunks.push(
          <ResultCodeValueChunk value={value}>
            {getChunks(children, start, end)}
          </ResultCodeValueChunk>
        )
        lastPos = end
      }
      chunks.push(source.slice(lastPos, end))
      return chunks
    }
    return getChunks(sortedRecords, 0, source.length)
  }, [result, source, version])

  return <div class="result-code">{chunks}</div>
}

type Position = {
  top: number
  bottom: number
  left: number
  right: number
}

const ResultCodeValueChunk = ({
  children,
  value
}: {
  children: ComponentChildren
  value: RecordMeta[]
}) => {
  const [hoveredPosition, setHovered] = useState<Position>()
  const onMouseOver: JSX.GenericEventHandler<HTMLElement> = useCallback((e) => {
    if (e.target === e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect()
      setHovered({
        top: window.scrollY + rect.top,
        bottom: window.scrollY + rect.bottom,
        left: window.scrollX + rect.left,
        right: window.scrollX + rect.right
      })
    }
  }, [])
  const onMouseOut: JSX.GenericEventHandler<HTMLElement> = useCallback(() => {
    setHovered(undefined)
  }, [])

  return (
    <span
      class="value-chunk"
      data-type={value.map((v) => v.type).join(' ')}
      data-hovered={!!hoveredPosition}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      {children}
      {hoveredPosition ? (
        <ResultCodeValueTooltip position={hoveredPosition} value={value} />
      ) : null}
    </span>
  )
}

const ResultCodeValueTooltip = ({
  position,
  value
}: {
  position: Position
  value: RecordMeta[]
}) => {
  const size = { width: 200, height: 100 }
  const margin = 32

  const style = {
    height: size.height,
    width: size.width,
    ...(position.left + size.width + margin < window.innerWidth
      ? { left: position.left }
      : { right: window.innerWidth - position.right }),
    ...(position.top + size.height + margin < window.innerHeight
      ? { top: position.bottom }
      : { bottom: window.innerHeight - position.top })
  }

  return createPortal(
    <div class="tooltip" style={style}>
      <ul>
        {value.map((v) => {
          const type = v.type
          switch (type) {
            case 'import-statement':
              return <li>Import Statement (type: {v.importType})</li>
            case 'import-module-specifier':
              return <li>Import Module Specifier: {JSON.stringify(v.value)}</li>
            case 'dynamic-import':
              return <li>Dynamic Import Start Position</li>
            case 'import-assertion':
              return <li>Import Assertion Start Position</li>
            case 'export-exported-name':
              return <li>Export Exported Name: {JSON.stringify(v.value)}</li>
            case 'export-local-name':
              return <li>Export Local Name: {JSON.stringify(v.value)}</li>
          }
          throw new Error(`Invalid type: ${type satisfies never}`)
        })}
      </ul>
    </div>,
    document.getElementById('tooltips')!
  )
}
