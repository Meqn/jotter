/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  // roots: ['<rootDir>'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  collectCoverage: true, // 是否显示覆盖率报告
}