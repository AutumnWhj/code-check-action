import {
  ActionOptionsType,
  GitHubAnnotation,
  GitHubAnnotationLevel,
  ReportCounts
} from '../type/eslint-type'

import eslint from 'eslint'
import {getOctokit} from '@actions/github'

import {error as logError} from '@actions/core'
import path from 'path'

class EslintRunner {
  private name = 'Eslint Run'

  private octokit: any

  private opts: ActionOptionsType

  checkRunID: number = -1

  constructor(githubToken: string, options: ActionOptionsType) {
    this.octokit = getOctokit(githubToken)
    this.opts = options
  }

  async run() {
    this.checkRunID = await this.startGitHubCheck()
    console.log('this.checkRunID', this.checkRunID)
    const report = this.runEslintCheck()!
    console.log('report', report)

    const {success, annotations, counts} = this.prepareAnnotation(report)
    console.log('success, annotations, counts', success, annotations, counts)
    // if annotations are too large, split them into check-updates
    const restOfAnnotation = await this.handleAnnotations(annotations, counts)
    console.log('restOfAnnotation', restOfAnnotation)

    this.finishGitHubCheck(success, restOfAnnotation, counts)
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
          await this.updateAnnotation(toProcess, counts)
        } catch (e) {
          const error: any = e
          // eslint-disable-next-line i18n-text/no-en
          exitWithError(`Fail processing annotations: ${error.message}`)
        }
      }
    }
    return leftAnnotations
  }

  private async updateAnnotation(
    annotations: Array<GitHubAnnotation>,
    counts: ReportCounts
  ) {
    try {
      await this.octokit.checks.update({
        owner: this.opts.repoOwner,
        repo: this.opts.repoName,
        check_run_id: this.checkRunID,
        status: 'in_progress',
        output: {
          title: this.name,
          summary: `Found ${counts.error} error(s), ${counts.warning} warning(s).`,
          annotations
        }
      })
    } catch (e) {
      const error: any = e
      exitWithError(error.message)
    }
  }

  private async startGitHubCheck() {
    let runId = -1
    try {
      const response = await this.octokit.checks.create({
        name: this.name,
        head_sha: this.opts.prSha,
        repo: this.opts.repoName,
        owner: this.opts.repoOwner,
        started_at: new Date().toISOString(),
        status: 'in_progress'
      })
      console.log('startGitHubCheck', response)
      runId = response.data.id
    } catch (e) {
      const error: any = e
      exitWithError(error.message)
    }

    return runId
  }

  private async finishGitHubCheck(
    success: boolean,
    annotations: Array<GitHubAnnotation>,
    counts: ReportCounts
  ) {
    try {
      await this.octokit.checks.update({
        owner: this.opts.repoOwner,
        repo: this.opts.repoName,
        check_run_id: this.checkRunID,
        status: 'completed',
        completed_at: new Date().toISOString(),
        conclusion: success ? 'success' : 'failure',
        output: {
          title: this.name,
          summary: `Found ${counts.error} error(s), ${counts.warning} warning(s).`,
          annotations
        }
      })
    } catch (e) {
      const error: any = e
      exitWithError(error.message)
    }
  }

  private pathRelative(location: string) {
    return path.resolve(this.opts.repoPath, location)
  }

  private runEslintCheck() {
    const cliOptions = {
      useEslintrc: false,
      configFile: this.pathRelative(this.opts.eslintConfig),
      extensions: this.opts.eslintExtensions,
      cwd: this.opts.repoPath
    }

    try {
      const cli = new eslint.CLIEngine(cliOptions)
      const lintFiles = this.opts.eslintFiles.map(this.pathRelative)

      return cli.executeOnFiles(lintFiles)
    } catch (e) {
      const error: any = e
      exitWithError(error.message)

      return null
    }
  }

  private prepareAnnotation(report: eslint.CLIEngine.LintReport): any {
    // 0 - no error, 1 - warning, 2 - error
    const reportLevel = ['', 'warning', 'failure']

    const githubAnnotations: Array<GitHubAnnotation> = []
    const {results} = report
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

      return {
        success: report.errorCount === 0,
        annotations: githubAnnotations,
        counts: {
          error: report.errorCount,
          warning: report.warningCount
        }
      }
    }
  }
}

function exitWithError(errorMessage: string): void {
  logError(errorMessage)
  process.exit(1)
}

export default EslintRunner
