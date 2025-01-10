import * as github from '@actions/github'
import { exec } from '@actions/exec'
import { readFileSync, unlinkSync } from 'fs'
import type { GetResponseDataTypeFromEndpointMethod } from '@octokit/types'
import { BUILD_SIZE_COMMENT_LANDMARK } from './constants'

export async function postBuildSizeToPR(
  webGLBuildDir: string,
  octokit: ReturnType<typeof github.getOctokit>
) {
  if (github.context.eventName !== 'pull_request') return
  const prNumber = github.context.payload.pull_request?.number
  if (!prNumber) return

  const buildSize = await getBuildSize(webGLBuildDir)
  const body = formatBody(buildSize)

  const existingComment = await findExistingComment(octokit, prNumber)

  if (existingComment) {
    await octokit.rest.issues.updateComment({
      ...github.context.repo,
      comment_id: existingComment.id,
      body,
    })
  } else {
    await octokit.rest.issues.createComment({
      ...github.context.repo,
      issue_number: prNumber,
      body,
    })
  }
}

async function getBuildSize(webGLBuildDir: string) {
  const tempFile = 'build_size.txt'
  await exec(`tree build`)
  await exec(`tree ./build`)
  await exec(`tree ${webGLBuildDir}`)
  await exec(`du -a -h --max-depth=0 ${webGLBuildDir}/* > ${tempFile}`)
  const output = readFileSync(tempFile, 'utf8')
  unlinkSync(tempFile)
  return output
}

function formatBody(buildSize: string) {
  return `
### :file_folder: Artifact Build Size Info!
___
\`\`\`
${buildSize}
\`\`\`
<!-- ${BUILD_SIZE_COMMENT_LANDMARK} -->
`
}

async function findExistingComment(
  octokit: ReturnType<typeof github.getOctokit>,
  prNumber: number
) {
  // https://github.com/thollander/actions-comment-pull-request/blob/e4a76dd2b0a3c2027c3fd84147a67c22ee4c90fa/src/main.ts#L126
  type ListCommentsResponseDataType = GetResponseDataTypeFromEndpointMethod<
    typeof octokit.rest.issues.listComments
  >
  let comment: ListCommentsResponseDataType[0] | undefined
  for await (const { data: comments } of octokit.paginate.iterator(
    octokit.rest.issues.listComments,
    {
      ...github.context.repo,
      issue_number: prNumber,
    }
  )) {
    comment = comments.find((comment) => comment?.body?.includes(BUILD_SIZE_COMMENT_LANDMARK))
    if (comment) break
  }

  return comment
}
