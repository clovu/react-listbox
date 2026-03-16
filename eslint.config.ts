import antfu from '@antfu/eslint-config'
import cspellPlugin from '@cspell/eslint-plugin'

export default antfu(
  {
    type: 'lib',
    react: true,
    pnpm: true,
  },
  {
    plugins: [cspellPlugin],
  },
  {
    ignores: ['.agents/', '.claude/**/*.md'],
  },
  {
    rules: {
      'ts/explicit-function-return-type': 'off',
      'markdown/require-alt-text': 'off',
    },
  },
)
