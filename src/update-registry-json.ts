import type { Compression, Registry } from './types'

export function updateRegistryJSON({
  gameName,
  urlPrefix,
  compression,
  argusIDUnityMethodReceiveJWT,
  currentJSON,
}: {
  gameName: string
  urlPrefix: string
  compression: Compression
  argusIDUnityMethodReceiveJWT: string
  currentJSON: Registry
}) {
  const map = new Map(Object.entries(currentJSON))
  map.set(gameName, {
    url_prefix: urlPrefix,
    compression,
    argus_id_unity_methods: { ReceiveJWT: argusIDUnityMethodReceiveJWT },
  })
  return Object.fromEntries(map)
}
