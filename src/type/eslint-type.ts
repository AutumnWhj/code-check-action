export interface EslintOptionsType {
  eslintFiles: string[]
  eslintConfig: string
  eslintExtensions: string[]
}
export interface ActionOptionsType extends EslintOptionsType {
  repoName: string
  repoOwner: string
  repoPath: string
  prSha: string
  pullNumber: number
}

export type GitHubAnnotationLevel = 'notice' | 'warning' | 'failure'

export type GitHubAnnotation = {
  annotation_level: GitHubAnnotationLevel
  end_column?: number
  end_line: number
  message: string
  path: string
  raw_details?: string
  start_column?: number
  start_line: number
  title?: string
}

export type ReportCounts = {
  error: number
  warning: number
}
