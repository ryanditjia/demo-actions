import { COMPRESSIONS } from './constants'

export type Compression = (typeof COMPRESSIONS)[number]

// The first string is the `objectName` (the name of an object in the game’s Unity scene)
// The second string is the `methodName` (the name of the method attached to that object)
// Learn more: https://docs.unity3d.com/6000.0/Documentation/Manual/web-interacting-browser-unity-to-js.html
export type ArgusIDUnityMethods = {
  // The `ReceiveJWT` method is used to receive the JWT from the Argus ID login flow
  ReceiveJWT: string
}

export type UnityWebGLBuild = {
  url_prefix: string
  compression: Compression
  argus_id_unity_methods: ArgusIDUnityMethods
}

export type Registry = {
  [key: string]: UnityWebGLBuild
}
