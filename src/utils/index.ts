import axios from 'axios'
const getUpdatePrUrl = (repository: string, number: number): string => {
  return `https://api.github.com/repos/${repository}/pulls/${number}`
}
export const updatePullRequest = async (params: any): Promise<void> => {
  const {options, annotation} = params || {}
  console.log('updatePullRequest--options: ', options)
  console.log('annotation: ', annotation)
  const {githubToken, pullNumber, repoName, repoOwner} = options
  const repository = `${repoOwner}/${repoName}`
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
        body: '测试测试测试/n测试测试测试',
        state: 'close'
      }
    })
    // const result = {
    //   msgtype: 'text',
    //   text: {
    //     content: `🤔项目${repository}：【${headBranch}】分支合并到【${baseBranch}】有新PR，请及时处理~`,
    //     mentioned_mobile_list: ['@all']
    //   }
    // }
    // await sendMsgToWeChat({result, webHook: wechatKey})
  } catch (error) {
    console.error('updatePullRequest--error', error)
  }
}
