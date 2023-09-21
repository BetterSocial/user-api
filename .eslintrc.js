module.exports = {
  env: {
    node: true,
    es2021: true,
    'jest/globals': true
  },
  extends: ['eslint:recommended', 'plugin:import/recommended', 'plugin:prettier/recommended'],
  plugins: ['prettier', 'import'],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  overrides: [
    {
      files: ['__tests__/**/*.js'],
      extends: [
        'eslint:recommended',
        'plugin:import/recommended',
        'plugin:jest/recommended',
        'plugin:prettier/recommended'
      ],
      plugins: ['jest', 'prettier', 'import']
    }
  ],
  rules: {
    'no-unused-vars': ['error', {argsIgnorePattern: '^_', varsIgnorePattern: '^_'}]
  }
};
