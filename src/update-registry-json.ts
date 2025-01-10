import type { Compression, Registry } from './types'

export function updateRegistryJSON({
  gameName,
  urlPrefix,
  compression,
  currentJSON,
}: {
  gameName: string
  urlPrefix: string
  compression: Compression
  currentJSON: Registry
}) {
  const map = new Map(Object.entries(currentJSON))
  map.set(gameName, { url_prefix: urlPrefix, compression })
  return Object.fromEntries(map)
}
