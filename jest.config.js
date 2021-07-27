// jest.config.js
// Sync object
/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  verbose: true,
  setupFilesAfterEnv: [
    "<rootDir>/services/getstream/__mocks__/getstream.js",
    "<rootDir>/services/jwt/__mocks__/jsonwebtoken.js",

  ],
};

module.exports = config;
