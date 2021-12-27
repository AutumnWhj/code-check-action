import axios from 'axios'
const getUpdatePrUrl = (repository: string, number: number): string => {
  return `https://api.github.com/repos/${repository}/pulls/${number}`
}
const getCommentsPrUrl = (repository: string, number: number): string => {
  return `https://api.github.com/repos/${repository}/pulls/${number}/comments`
}
// https://github.com/AutumnWhj/code-check-action/pull/19
export const updatePullRequest = async (params: any): Promise<void> => {
  const {options, eslintResults} = params || {}
  console.log('updatePullRequest--options: ', options)
  console.log('eslintResults: ', eslintResults)
  const {
    error: errorFiles,
    warning: warningFiles,
    annotation
  } = eslintResults || {}
  const {githubToken, pullNumber, repoName, repoOwner, commitSha} = options
  const repository = `${repoOwner}/${repoName}`
  console.log('repository: ', repository)
  const prState = errorFiles > 0 ? 'close' : 'open'
  const resultBody = `本次Eslint检查结果：出现error的文件有${errorFiles}个，warning的文件有${warningFiles}个`
  try {
    await axios({
      method: 'PATCH',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'content-type': 'application/json',
        Authorization: `Bearer ${githubToken}`
      },
      url: getUpdatePrUrl(repository, pullNumber),
      data: {
        title: `🤔项目${repository}PR：Eslint检查：`,
        body: resultBody,
        state: prState
      }
    })
    if (warningFiles > 0) {
      const commentsPrUrl = getCommentsPrUrl(repository, pullNumber)
      for (const index in annotation) {
        await commentPullRequest({
          commentsPrUrl,
          githubToken,
          commitSha,
          annotation: annotation[index]
        })
      }
    }
    // await sendMsgToWeChat({result, webHook: wechatKey})
  } catch (error) {
    console.error('updatePullRequest--error', error)
  }
}
export const commentPullRequest = async (params: any): Promise<void> => {
  const {githubToken, commentsPrUrl, commitSha, annotation} = params || {}
  console.log('commentPullRequest: ', annotation)
  const {path, start_line, annotation_level, message} = annotation || {}
  const resultBody = `${annotation_level}: ${message}`
  try {
    await axios({
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'content-type': 'application/json',
        Authorization: `Bearer ${githubToken}`
      },
      url: commentsPrUrl,
      data: {
        body: resultBody,
        path,
        line: start_line,
        start_side: 'RIGHT',
        commit_id: commitSha
      }
    })
  } catch (error) {
    console.error('commentPullRequest--error', error)
  }
}
