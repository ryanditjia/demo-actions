const core = require('@actions/core')
const github = require('@actions/github')

try {
  const updatedValue = core.getInput('updated-value')
  const octokit = github.getOctokit(core.getInput('myToken'))

  const prodJson = require('./prod.json')
  prodJson.name = updatedValue

  octokit.rest.repos
    .createOrUpdateFileContents({
      owner: 'ryanditjia',
      repo: 'demo-actions',
      path: 'prod.json',
      message: 'feat: update prod.json',
      content: Buffer.from(JSON.stringify(prodJson, null, 2)).toString('base64'),
      branch: 'registry',
    })
    .then((response) => {
      console.log(response)
    })
} catch (error) {
  core.setFailed(error.message)
}
