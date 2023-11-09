const versionRegex = /^(\d+)\.(\d+)\.(\d+)$/

export const isVersionLower = (version: string, target: string) => {
  const parsedVersion = version.match(versionRegex)
  if (!parsedVersion) throw new Error(`Invalid version: ${version}`)
  const parsedTarget = target.match(versionRegex)
  if (!parsedTarget) throw new Error(`Invalid version: ${target}`)

  for (let i = 1; i < 4; i++) {
    if (+parsedVersion[i] < +parsedTarget[i]) return true
    if (+parsedVersion[i] > +parsedTarget[i]) return false
  }
  return false
}
