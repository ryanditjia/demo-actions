import core from '@actions/core'
import github from '@actions/github'
import fs from 'fs/promises'
import { R2Uploader } from './r2-uploader'
import { updateRegistryJSON } from './update-registry-json'
import { COMPRESSIONS, JSON_BY_ENV, REGISTRY_DIR, WEB_PLAYER_ENVS } from './constants'
import type { Compression } from './types'

main()

const isValidWebPlayerEnv = (env: string): env is keyof typeof JSON_BY_ENV =>
  WEB_PLAYER_ENVS.some((e) => e === env)

const isValidCompression = (compression: string): compression is Compression =>
  COMPRESSIONS.some((e) => e === compression)

async function main() {
  try {
    const webPlayerRepoPat = core.getInput('web-player-repo-pat', { required: true })
    const webPlayerEnv = core.getInput('web-player-env', { required: true })
    const gameName = core.getInput('game-name', { required: true })
    const compression = core.getInput('compression') || 'none'
    const webGLBuildDir = core.getInput('webgl-build-dir', { required: true })
    const r2AccessKey = core.getInput('r2-access-key', { required: true })
    const r2SecretKey = core.getInput('r2-secret-key', { required: true })
    const r2AccountId = core.getInput('r2-account-id', { required: true })
    const r2Bucket = core.getInput('r2-bucket', { required: true })
    const r2DestinationDir = core.getInput('r2-destination-dir', { required: true })
    const r2CustomDomain = core.getInput('r2-custom-domain', { required: true })

    if (!isValidWebPlayerEnv(webPlayerEnv)) {
      throw new Error(
        `Invalid web-player-env: ${webPlayerEnv}, must be one of ${WEB_PLAYER_ENVS.join(', ')}`
      )
    }

    if (!isValidCompression(compression)) {
      throw new Error(
        `Invalid compression: ${compression}, must be one of ${COMPRESSIONS.join(', ')}`
      )
    }

    const r2Uploader = new R2Uploader({
      r2AccessKey,
      r2SecretKey,
      r2AccountId,
      r2Bucket,
      r2DestinationDir,
      webGLBuildDir,
    })

    const files = await fs.readdir(webGLBuildDir)
    const uploadPromises = files.map((file) => r2Uploader.upload(file))
    await Promise.all(uploadPromises)

    const octokit = github.getOctokit(webPlayerRepoPat)
    const owner = 'ryanditjia'
    const repo = 'demo-actions'
    const jsonFilename = JSON_BY_ENV[webPlayerEnv]
    const pathToRegistryFile = `${REGISTRY_DIR}/${jsonFilename}`
    const branch = 'registry'

    const { data: currentFile } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: pathToRegistryFile,
      ref: branch,
    })

    if (Array.isArray(currentFile) || currentFile.type !== 'file') {
      throw new Error(`Invalid file: ${jsonFilename}`)
    }

    const currentJSON = JSON.parse(Buffer.from(currentFile.content, 'base64').toString())

    const updatedJSON = updateRegistryJSON({
      gameName,
      urlPrefix: `${r2CustomDomain}/${r2DestinationDir}/WebGL`,
      compression,
      currentJSON,
    })

    const response = await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: pathToRegistryFile,
      committer: {
        name: 'github-actions[bot]',
        email: 'github-actions[bot]@users.noreply.github.com',
      },
      message: `feat: update ${jsonFilename}`,
      content: Buffer.from(JSON.stringify(updatedJSON, null, 2)).toString('base64'),
      branch: branch,
      sha: currentFile.sha,
    })

    if (response.status === 200 || response.status === 201) {
      console.log(updatedJSON)
    } else {
      throw new Error(`Unable to update ${jsonFilename}`)
    }
  } catch (error) {
    let errorMsg = 'Something went wrong'
    if (error instanceof Error) errorMsg = error.message
    core.setFailed(errorMsg)
  }
}
