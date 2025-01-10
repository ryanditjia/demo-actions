export const COMPRESSIONS = ['brotli', 'gzip', 'none'] as const
export const WEB_PLAYER_ENVS = ['production', 'development'] as const
export const REGISTRY_DIR = 'registries'
export const JSON_BY_ENV = {
  production: 'production.json',
  development: 'development.json',
}
