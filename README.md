# react-listbox

Accessible listbox primitives for React.

## Playground

<https://react-listbox-playground.vercel.app/>

## Packages

| Package | Description |
| --- | --- |
| [`react-listbox-primitives`](./packages/listbox) | Public library package with listbox primitives (`ListboxRoot`, `ListboxContent`, `ListboxItem`, etc.). |
| [`playground`](./playground) | Internal playground app for manual verification and local demos. |

## Quick Start

```bash
pnpm i
pnpm dev
```

- `pnpm dev`: run `react-listbox-primitives` tsdown watch + playground dev together (recommended)
- `pnpm start`: same as `pnpm dev`

## Development

```bash
pnpm dev
pnpm build
pnpm test
pnpm lint
pnpm typecheck
```

## Release

```bash
pnpm run release
```

The repository is set up for CI-based publishing (npm Trusted Publisher workflow).

Release checklist:

- Verify the playground: <https://react-listbox-playground.vercel.app/>

## License

[MIT](./LICENSE) License © [Clover You](https://github.com/clovu)
