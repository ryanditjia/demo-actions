import { describe, it, expect } from 'vitest'
import { updateRegistryJSON } from './update-json'

const currentJSON = {
  blocksurvivor: {
    url_prefix: 'https://cdn.blocksurvivor.com/old1234/WebGL',
    compression: 'brotli',
  },
  anothergame: {
    url_prefix: 'https://cdn.anothergame.com/old1234/WebGL',
    compression: 'brotli',
  },
}

describe('updateRegistryJSON', () => {
  it('should update in-place if existing game', () => {
    const newUrlPrefix = 'https://cdn.blocksurvivor.com/new1234/WebGL'

    const updatedJSON = updateRegistryJSON({
      gameName: 'blocksurvivor',
      urlPrefix: newUrlPrefix,
      compression: 'brotli',
      currentJSON: currentJSON,
    })

    expect(updatedJSON).toEqual({
      blocksurvivor: {
        url_prefix: newUrlPrefix,
        compression: 'brotli',
      },
      anothergame: currentJSON.anothergame,
    })
  })

  it('should add new game if not existing', () => {
    const newGameName = 'anothernewgame'
    const newUrlPrefix = 'https://cdn.anothernewgame.com/new1234/WebGL'

    const updatedJson = updateRegistryJSON({
      gameName: newGameName,
      urlPrefix: newUrlPrefix,
      compression: 'brotli',
      currentJSON: currentJSON,
    })

    expect(updatedJson).toEqual({
      ...currentJSON,
      [newGameName]: { url_prefix: newUrlPrefix, compression: 'brotli' },
    })
  })
})
