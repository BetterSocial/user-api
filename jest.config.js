const mongodb_preset = require('@shelf/jest-mongodb/jest-preset');
// jest.config.js
// Sync object
/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  projects: [
    {
      displayName: 'api',
      ...mongodb_preset,
      setupFiles: ['<rootDir>/__tests__/api/__setups__/env.js'],
      setupFilesAfterEnv: ['<rootDir>/__tests__/api/__setups__/postgres.js'],
      testMatch: ['<rootDir>/__tests__/api/**/*.test.js'],
      modulePathIgnorePatterns: ['<rootDir>/dist/']
    }
  ],
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/services/getstream/__mocks__/getstream.js'],
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text'],
  coveragePathIgnorePatterns: [
    '<rootDir>/bin',
    '<rootDir>/dist',
    '<rootDir>/node_modules/',
    '<rootDir>/app.js'
  ]
};

module.exports = config;
