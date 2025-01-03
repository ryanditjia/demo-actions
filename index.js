const fs = require('fs')
const core = require('@actions/core')
const github = require('@actions/github')

try {
  const updatedValue = core.getInput('updated-value')
  // update prod.json with updatedValue
  const prodJson = require('./prod.json')
  prodJson.name = updatedValue
  fs.writeFileSync('./prod.json', JSON.stringify(prodJson, null, 2))
} catch (error) {
  core.setFailed(error.message)
}
