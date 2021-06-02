// jest.config.js
// Sync object
/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  verbose: true,
  setupFilesAfterEnv: [
    "<rootDir>/__mocks__/getstream.js"
  ],
};

module.exports = config;