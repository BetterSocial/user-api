module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    jest: true
  },
  extends: ['airbnb-base', 'prettier'],
  overrides: [
    {
      env: {
        node: true
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script'
      }
    }
  ],
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    'linebreak-style': 'off',
    'no-console': 'off',
    'import/prefer-default-export': 'off',
    'no-use-before-define': 'warn',
    'no-param-reassign': 'off',
    'react/prop-types': 'off',
    camelcase: 'off',
    'import/no-extraneous-dependencies': 'off',
    'no-useless-escape': 'warn',
    'no-nested-ternary': 'off',
    'no-case-declarations': 'warn',
    'comma-dangle': 'off',
    'no-plusplus': 'off',
    'no-await-in-loop': 'off',
    'prefer-const': 'warn',
    'no-restricted-syntax': 'off',
    semi: ['error', 'always'],
    'prettier/prettier': [
      2,
      {
        singleQuote: true,
        bracketSpacing: false,
        bracketSameLine: true,
        arrowParens: 'always',
        printWidth: 100,
        trailingComma: 'none',
        proseWrap: 'preserve'
      }
    ]
  }
};
