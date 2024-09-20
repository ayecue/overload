/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: [
    'ts',
    'js'
  ],
  testRegex: '/tests/.*\\.test.(ts|js)$'
};