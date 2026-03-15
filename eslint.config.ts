import antfu from '@antfu/eslint-config'

export default antfu(
  {
    type: 'lib',
    react: true,
    pnpm: true,
  },
  {
    ignores: ['.agents/**', '.claude/**/*.md'],
  },
  {
    rules: {
      'ts/explicit-function-return-type': 'off',
      'markdown/require-alt-text': 'off',
    },
  },
)
