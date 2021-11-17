import {
  ActionOptionsType,
  GitHubAnnotation,
  GitHubAnnotationLevel,
  ReportCounts
} from '../type/eslint-type'

import {ESLint} from 'eslint'
import {error as logError} from '@actions/core'
import path from 'path'

class EslintRunner {
  name = 'Eslint Run'

  opts: ActionOptionsType

  checkRunID: number = -1

  constructor(githubToken: string, options: ActionOptionsType) {
    console.log('22222', githubToken, options)
    this.opts = options
    console.log('this.opts: ', this.opts)
  }

  async run() {
    console.log('this.checkRunID', this.checkRunID)
    const report = await this.runEslintCheck()!
    console.log('report', report)

    // const {success, annotations, counts} = this.prepareAnnotation(report)
    // console.log('counts: ', counts)
    // console.log('annotations: ', annotations)
    // console.log('success: ', success)
    // if annotations are too large, split them into check-updates
    // const restOfAnnotation = await this.handleAnnotations(annotations, counts)
    // console.log('restOfAnnotation', restOfAnnotation)
  }

  private async handleAnnotations(
    annotations: Array<GitHubAnnotation>,
    counts: ReportCounts
  ) {
    const leftAnnotations = [...annotations]
    if (leftAnnotations.length > 50) {
      while (leftAnnotations.length > 50) {
        const toProcess = leftAnnotations.splice(0, 50)
        try {
          console.log('toProcess: ', toProcess, counts)
        } catch (e) {
          const error: any = e
          // eslint-disable-next-line i18n-text/no-en
          exitWithError(`Fail processing annotations: ${error.message}`)
        }
      }
    }
    return leftAnnotations
  }

  private pathRelative(location: string) {
    const {repoPath} = this.opts || {}
    return path.resolve(repoPath, location)
  }

  private async runEslintCheck() {
    const {eslintConfig, eslintExtensions, repoPath, eslintFiles} =
      this.opts || {}
    const cliOptions = {
      useEslintrc: false,
      overrideConfigFile: this.pathRelative(eslintConfig),
      extensions: eslintExtensions,
      cwd: repoPath
    }
    console.log('runEslintCheck----', cliOptions)
    try {
      const eslint = new ESLint(cliOptions)

      const lintFiles = eslintFiles.map(this.pathRelative)
      console.log('lintFiles: ', lintFiles)

      return await eslint.lintFiles(lintFiles)
    } catch (e) {
      const error: any = e
      exitWithError(error.message)

      return null
    }
  }

  private prepareAnnotation(results: ESLint.LintResult[]): any {
    // 0 - no error, 1 - warning, 2 - error
    const reportLevel = ['', 'warning', 'failure']

    const githubAnnotations: Array<GitHubAnnotation> = []
    for (const iterator of results) {
      const {filePath, messages} = iterator
      const repoPath = filePath.replace(`${this.opts.repoPath}/`, '')

      for (const msg of messages) {
        const {ruleId, message, severity, endLine, line} = msg

        const annotation: GitHubAnnotation = {
          path: repoPath,
          start_line: line,
          end_line: endLine || line,
          annotation_level: reportLevel[severity] as GitHubAnnotationLevel,
          message: `${ruleId}: ${message}`
        }

        githubAnnotations.push(annotation)
      }
      return results
      // return {
      //   success: results.errorCount === 0,
      //   annotations: githubAnnotations,
      //   counts: {
      //     error: results.errorCount,
      //     warning: results.warningCount
      //   }
      // }
    }
  }
}

function exitWithError(errorMessage: string): void {
  logError(errorMessage)
  process.exit(1)
}

export default EslintRunner
