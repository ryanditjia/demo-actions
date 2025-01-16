import { describe, it, expect } from 'vitest'
import { updateRegistryJSON } from './update-registry-json'
import type { Registry } from './types'

const currentJSON = {
  blocksurvivor: {
    url_prefix: 'https://cdn.blocksurvivor.com/old1234/WebGL',
    compression: 'brotli',
    argus_id_unity_methods: {
      ReceiveJWT: 'Bootstrap.ReceiveJWT',
    },
  },
  anothergame: {
    url_prefix: 'https://cdn.anothergame.com/old1234/WebGL',
    compression: 'brotli',
    argus_id_unity_methods: {
      ReceiveJWT: 'Bootstrap.ReceiveJWT',
    },
  },
} satisfies Registry

describe('updateRegistryJSON', () => {
  it('should update in-place if existing game', () => {
    const newUrlPrefix = 'https://cdn.blocksurvivor.com/new1234/WebGL'
    const newArgusIDUnityMethodReceiveJWT = 'BootstrapNew.ReceiveJWT'

    const updatedJSON = updateRegistryJSON({
      gameName: 'blocksurvivor',
      urlPrefix: newUrlPrefix,
      compression: 'brotli',
      argusIDUnityMethodReceiveJWT: newArgusIDUnityMethodReceiveJWT,
      currentJSON,
    })

    expect(updatedJSON).toEqual({
      blocksurvivor: {
        url_prefix: newUrlPrefix,
        compression: 'brotli',
        argus_id_unity_methods: {
          ReceiveJWT: newArgusIDUnityMethodReceiveJWT,
        },
      },
      anothergame: currentJSON.anothergame,
    })
  })

  it('should add new game if not existing', () => {
    const newGameName = 'anothernewgame'
    const newUrlPrefix = 'https://cdn.anothernewgame.com/new1234/WebGL'
    const newArgusIDUnityMethodReceiveJWT = 'Bootstrap1234.ReceiveJWT'

    const updatedJson = updateRegistryJSON({
      gameName: newGameName,
      urlPrefix: newUrlPrefix,
      compression: 'brotli',
      argusIDUnityMethodReceiveJWT: newArgusIDUnityMethodReceiveJWT,
      currentJSON: currentJSON,
    })

    expect(updatedJson).toEqual({
      ...currentJSON,
      [newGameName]: {
        url_prefix: newUrlPrefix,
        compression: 'brotli',
        argus_id_unity_methods: {
          ReceiveJWT: 'Bootstrap1234.ReceiveJWT',
        },
      },
    })
  })
})
