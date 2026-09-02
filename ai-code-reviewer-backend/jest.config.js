/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/*.test.ts'],
  setupFiles: ['<rootDir>/__tests__/setup-env.ts'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/teardown.ts'],
  testTimeout: 60000,
  maxWorkers: 1,
  clearMocks: true,
  forceExit: true,
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.test.json',
      },
    ],
  },
};
