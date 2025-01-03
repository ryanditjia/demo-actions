const fs = require('fs')
const core = require('@actions/core')
const github = require('@actions/github')

try {
  const updatedValue = core.getInput('updated-value')
  // update prod.json with updatedValue
  const prodJson = require('./prod.json')
  prodJson.name = updatedValue
  fs.writeFileSync('./prod.json', JSON.stringify(prodJson, null, 2))
  // commit the change
  console.log('process.env.GITHUB_TOKEN', process.env.GITHUB_TOKEN)
  const octokit = github.getOctokit(process.env.GITHUB_TOKEN)
  octokit.rest.git
    .createCommit({
      owner: 'ryanditjia',
      repo: 'demo-actions',
      message: 'feat: update prod.json',
      tree: 'registry',
    })
    .then((response) => {
      console.log(response)
    })
} catch (error) {
  core.setFailed(error.message)
}
