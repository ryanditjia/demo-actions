import { COMPRESSIONS } from './constants'

export type Compression = (typeof COMPRESSIONS)[number]

export type UnityWebGLBuild = {
  url_prefix: string
  compression: Compression
}

export type Registry = {
  [key: string]: UnityWebGLBuild
}
