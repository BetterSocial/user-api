module.exports = {
  env: {
    node: true,
    es2021: true,
    'jest/globals': true
  },
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  overrides: [
    {
      env: {
        node: true,
        es2021: true,
        'jest/globals': true
      },
      files: ['__tests__/**/*.js'],
      extends: ['eslint:recommended', 'plugin:jest/recommended', 'plugin:prettier/recommended'],
      plugins: ['jest', 'prettier']
    }
  ],
  rules: {
    'no-unused-vars': ['error', {argsIgnorePattern: '^_', varsIgnorePattern: '^_'}]
  }
};
