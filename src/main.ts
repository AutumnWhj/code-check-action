// debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true
import {parseInputArray, runEslint} from './check/eslint'
import core from '@actions/core'

async function run(): Promise<void> {
  try {
    const githubToken: string = core.getInput('githubToken', {
      required: true
    })
    const eslintFiles: string = core.getInput('eslintFiles') || '.' // all files by default
    const eslintConfig: string = core.getInput('eslintConfig') || '.eslintrc' // .eslintrc by default
    const eslintExtensions: string =
      core.getInput('eslintExt') || 'js, ts, jsx, tsx'
    const inputOptions = {
      eslintFiles: parseInputArray(eslintFiles),
      eslintConfig,
      eslintExtensions: parseInputArray(eslintExtensions)
    }
    core.debug(`githubToken:${githubToken}`)
    core.debug(`options:${inputOptions}`)
    runEslint(githubToken, inputOptions)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
