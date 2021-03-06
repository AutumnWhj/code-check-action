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
        title: `ð¤é¡¹ç®${repository}PRï¼ã${headBranch}ãåæ¯åå¹¶å°ã${baseBranch}ã`,
        base: baseBranch,
        head: headBranch
      }
    })
    // const result = {
    //   msgtype: 'text',
    //   text: {
    //     content: `ð¤é¡¹ç®${repository}ï¼ã${headBranch}ãåæ¯åå¹¶å°ã${baseBranch}ãææ°PRï¼è¯·åæ¶å¤ç~`,
    //     mentioned_mobile_list: ['@all']
    //   }
    // }
    // await sendMsgToWeChat({result, webHook: wechatKey})
  } catch (error) {
    console.error('createPullRequest--error', error)
  }
}
