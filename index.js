const core = require('@actions/core')
const github = require('@actions/github')
const invariant = require('tiny-invariant')

const envs = ['prod', 'dev']
const compressionTypes = ['brotli', 'gzip', null]
const jsonByEnv = {
  prod: 'prod.json',
  dev: 'dev.json',
}

main()

async function main() {
  try {
    const webPlayerRepoPat = core.getInput('web-player-repo-pat')
    const webPlayerEnv = core.getInput('web-player-env')
    const gameName = core.getInput('game-name')
    const urlPrefix = core.getInput('url-prefix')
    const compression = core.getInput('compression')

    invariant(
      envs.includes(webPlayerEnv),
      `Invalid environment: ${webPlayerEnv}, must be one of ${envs.join(', ')}`
    )

    invariant(
      compressionTypes.includes(compression),
      `Invalid compression: ${compression}, must be one of ${compressionTypes.join(', ')}`
    )

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
