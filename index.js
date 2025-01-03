const core = require('@actions/core')
const github = require('@actions/github')

main()

async function main() {
  try {
    const updatedValue = core.getInput('updated-value')
    const octokit = github.getOctokit(core.getInput('myToken'))

    const prodJson = require('./prod.json')
    prodJson.name = updatedValue

    const { data: currentFile } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: 'prod.json',
      ref: 'registry',
    })

    const response = await octokit.rest.repos.createOrUpdateFileContents({
      owner: 'ryanditjia',
      repo: 'demo-actions',
      path: 'prod.json',
      message: 'feat: update prod.json',
      content: Buffer.from(JSON.stringify(prodJson, null, 2)).toString('base64'),
      branch: 'registry',
      sha: currentFile.sha,
    })

    console.log(response)
  } catch (error) {
    core.setFailed(error.message)
  }
}
