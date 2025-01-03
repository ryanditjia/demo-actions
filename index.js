const core = require('@actions/core')
const github = require('@actions/github')

main()

async function main() {
  try {
    const updatedValue = core.getInput('updated-value')
    const octokit = github.getOctokit(core.getInput('myToken'))

    const owner = 'ryanditjia'
    const repo = 'demo-actions'
    const path = 'prod.json'
    const branch = 'registry'

    const { data: currentFile } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    })

    const json = JSON.parse(Buffer.from(currentFile.content, 'base64').toString())
    json.name = updatedValue

    const response = await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      committer: {
        name: 'github-actions[bot]',
        email: 'github-actions[bot]@users.noreply.github.com',
      },
      message: `feat: update ${path}`,
      content: Buffer.from(JSON.stringify(json, null, 2)).toString('base64'),
      branch: branch,
      sha: currentFile.sha,
    })

    console.log(response)
  } catch (error) {
    core.setFailed(error.message)
  }
}
