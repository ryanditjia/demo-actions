export const COMPRESSIONS = ['brotli', 'gzip', 'none'] as const
export const WEB_PLAYER_ENVS = ['production', 'development'] as const

export const REGISTRY_REPO = {
  OWNER: 'ryanditjia',
  NAME: 'demo-actions',
  BRANCH: 'registry',
}
export const REGISTRY_DIR = 'registries'
export const JSON_BY_ENV = {
  production: 'production.json',
  development: 'development.json',
}

/**
 * Landmark of the Artifact Build Size Info comment.
 * Used to identify if there is already a comment in the PR.
 * If there is, we will update the comment instead of creating a new one.
 */
export const BUILD_SIZE_COMMENT_LANDMARK = 'artifact-build-size-info'
