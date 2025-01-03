/**
 * @param {Object} options
 * @param {string} options.gameName
 * @param {string} options.urlPrefix
 * @param {string} options.compression
 * @param {import("./types").Registry} options.currentJSON
 *
 * @returns {import("./types").Registry}
 */
export function updateRegistryJSON({ gameName, urlPrefix, compression, currentJSON }) {
  const map = new Map(Object.entries(currentJSON))
  map.set(gameName, { url_prefix: urlPrefix, compression })
  return Object.fromEntries(map)
}
