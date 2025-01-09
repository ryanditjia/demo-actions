const core = require('@actions/core')
const github = require('@actions/github')
const invariant = require('tiny-invariant')
const fs = require('fs/promises')
const { R2Uploader } = require('./r2-uploader')
const { updateRegistryJSON } = require('./update-json')

const envs = ['production', 'development']
const jsonByEnv = {
  production: 'production.json',
  development: 'development.json',
}

main()

async function main() {
  try {
    const webPlayerRepoPat = core.getInput('web-player-repo-pat', { required: true })
    const webPlayerEnv = core.getInput('web-player-env', { required: true })
    const gameName = core.getInput('game-name', { required: true })
    const webGLBuildDir = core.getInput('webgl-build-dir', { required: true })
    const r2AccessKey = core.getInput('r2-access-key', { required: true })
    const r2SecretKey = core.getInput('r2-secret-key', { required: true })
    const r2AccountId = core.getInput('r2-account-id', { required: true })
    const r2Bucket = core.getInput('r2-bucket', { required: true })
    const r2DestinationDir = core.getInput('r2-destination-dir', { required: true })

    invariant(
      envs.includes(webPlayerEnv),
      `Invalid web-player-env: ${webPlayerEnv}, must be one of ${envs.join(', ')}`
    )

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
    const jsonFilename = jsonByEnv[webPlayerEnv]
    const branch = 'registry'

    const { data: currentFile } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: jsonFilename,
      ref: branch,
    })

    const currentJSON = JSON.parse(Buffer.from(currentFile.content, 'base64').toString())

    const updatedJSON = updateRegistryJSON({
      gameName,
      urlPrefix,
      compression,
      currentJSON,
    })

    const response = await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: jsonFilename,
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
      throw new Error(`Failed to update ${jsonFilename}: ${response.status}`)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}
