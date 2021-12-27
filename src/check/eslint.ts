import {ActionOptionsType, EslintOptionsType} from '../type/eslint-type'
import EslintRunner from '../runner/eslint-runner'
import {context} from '@actions/github'

console.log('github.context', context)
const payload: any = context.payload
const pullNumber: any = payload.number

const {GITHUB_REPOSITORY = '', GITHUB_WORKSPACE, GITHUB_SHA} = process.env

export const parseInputArray = (input: string) => {
  return input
    .split(',')
    .reduce((acc, current) => [...acc, current.trim()], [] as Array<string>)
}

const [repoOwner, repoName] = GITHUB_REPOSITORY!.split('/')

export const runEslint = (
  githubToken: string,
  inputOptions: EslintOptionsType
) => {
  const options: ActionOptionsType = {
    ...inputOptions,
    repoName,
    repoOwner,
    repoPath: GITHUB_WORKSPACE!,
    prSha: GITHUB_SHA!,
    pullNumber
  }
  console.log('runEslint----', options)
  const action = new EslintRunner(githubToken, options)
  action.run()
}
