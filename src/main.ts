// debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true
import {debug, getInput, setFailed} from '@actions/core'
import {parseInputArray, runEslint} from './check/eslint'

// const pushPayload: any = github.context.payload
// const ref = github.context.ref

async function run(): Promise<void> {
  try {
    const githubToken: string = getInput('githubToken', {
      required: true
    })
    const eslintFiles: string = getInput('eslintFiles') || '.' // all files by default
    const eslintConfig: string = getInput('eslintConfig') || '.eslintrc' // .eslintrc by default
    const eslintExtensions: string = getInput('eslintExt') || 'js, ts, jsx, tsx'
    const inputOptions = {
      eslintFiles: parseInputArray(eslintFiles),
      eslintConfig,
      eslintExtensions: parseInputArray(eslintExtensions)
    }
    debug(`githubToken:${githubToken}`)
    debug(`options:${inputOptions}`)
    runEslint(githubToken, inputOptions)
  } catch (error) {
    if (error instanceof Error) setFailed(error.message)
  }
}

run()
