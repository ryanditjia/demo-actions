export type UnityWebGLBuild = {
  url_prefix: string
  compression: 'gzip' | 'brotli' | null
}

export type Registry = {
  [key: string]: UnityWebGLBuild
}
