import axios from 'axios'
const getUpdatePrUrl = (repository: string, number: number): string => {
  return `https://api.github.com/repos/${repository}/pulls/${number}`
}
export const updatePullRequest = async (params: any): Promise<void> => {
  const {repository, githubToken, headBranch, baseBranch} = params

  try {
    await axios({
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'content-type': 'application/json',
        Authorization: `Bearer ${githubToken}`
      },
      url: getUpdatePrUrl(repository, 100),
      data: {
        title: `🤔项目${repository}PR：【${headBranch}】分支合并到【${baseBranch}】`,
        base: baseBranch,
        head: headBranch
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
    console.error('createPullRequest--error', error)
  }
}
