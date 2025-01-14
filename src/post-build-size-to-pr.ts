import * as github from '@actions/github'
import * as core from '@actions/core'
import { exec, ExecOptions } from '@actions/exec'
import type { GetResponseDataTypeFromEndpointMethod } from '@octokit/types'
import { BUILD_SIZE_COMMENT_LANDMARK } from './constants'

export async function postBuildSizeToPR({
  gameName,
  webGLBuildDir,
  r2DestinationDir,
}: {
  gameName: string
  webGLBuildDir: string
  r2DestinationDir: string
}) {
  if (github.context.eventName !== 'pull_request') return

  const prNumber = github.context.payload.pull_request?.number
  if (!prNumber) return

  const buildSize = await getBuildSize(webGLBuildDir)
  const body = formatBody({ buildSize, gameName, r2DestinationDir })

  const githubToken = core.getInput('github-token')
  const octokit = github.getOctokit(githubToken)

  const existingComment = await findExistingComment(octokit, prNumber)

  if (existingComment) {
    await octokit.rest.issues.updateComment({
      ...github.context.repo,
      comment_id: existingComment.id,
      body,
    })
    console.log('💬 Updated build size in existing PR comment.')
  } else {
    await octokit.rest.issues.createComment({
      ...github.context.repo,
      issue_number: prNumber,
      body,
    })
    console.log('💬 Posted build size to PR comment.')
  }
}

async function getBuildSize(webGLBuildDir: string) {
  let output = ''
  let error = ''

  const options = {
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString()
      },
      stderr: (data: Buffer) => {
        error += data.toString()
      },
    },
    cwd: webGLBuildDir,
  } satisfies ExecOptions

  // using bash instead of du directly because of linked issue below
  // https://github.com/actions/toolkit/issues/346#issuecomment-743750559
  await exec(`/bin/bash -c "du -a -h --max-depth=0 * | sort -hr"`, [], options)

  if (error) throw new Error(error)
  return output
}

function formatBody({
  buildSize,
  gameName,
  r2DestinationDir,
}: {
  buildSize: string
  gameName: string
  r2DestinationDir: string
}) {
  return `
### :file_folder: Artifact Build Size Info!
___
\`\`\`
${buildSize}\`\`\`

### Preview

Preview URL: https://play.argus.dev/${gameName}/${r2DestinationDir}

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
