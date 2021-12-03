const {ESLint} = require('eslint')
const path = require('path')
const repoPath = '/Users/Autumn/Documents/Autumn/github/code-check-action'
const pathRelative = location => {
  return path.resolve(repoPath, location)
}
const cliOptions = {
  useEslintrc: false,
  overrideConfigFile: pathRelative('./.eslintrc.json'),
  extensions: ['ts'],
  cwd: pathRelative('./')
}
console.log('cliOptions: ', cliOptions)
const eslint = new ESLint(cliOptions)

const eslintFiles = ['./src']
const lintFiles = eslintFiles.map(location => path.resolve(repoPath, location))

console.log('lintFiles: ', lintFiles)
eslint.lintFiles(lintFiles).then(res => {
  console.log('lintFiles', res)
  const errors = ESLint.getErrorResults(res)
  console.log('errors: ', errors)
})
