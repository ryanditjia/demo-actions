import * as github from '@actions/github'
import { exec, ExecOptions } from '@actions/exec'
import { readFileSync } from 'fs'
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
  let output = ''
  let error = ''

  const options: ExecOptions = {
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString()
      },
      stderr: (data: Buffer) => {
        error += data.toString()
      },
    },
  }

  // https://github.com/actions/toolkit/issues/346#issuecomment-743750559
  await exec(`/bin/bash -c "du -a -h --max-depth=0 ${webGLBuildDir}/* | sort -hr"`, [], options)

  if (error) throw new Error(error)
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
