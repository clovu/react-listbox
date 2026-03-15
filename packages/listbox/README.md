# @listbox/react

Accessible listbox primitives for React.

## Features

- Single and multiple selection modes
- Controlled and uncontrolled value state
- Keyboard navigation (Arrow, Home, End, Enter, Space, Ctrl/Cmd+A)
- Group and group-label semantics
- `readOnly`, `disabled`, `required`, `orientation`, and `loop` support
- Composable primitives via `asChild`
- Styling via stable data attributes

## Installation

```bash
pnpm add @listbox/react
```

## Usage

```tsx
import {
  ListboxContent,
  ListboxItem,
  ListboxLabel,
  ListboxRoot,
} from '@listbox/react'
import { useState } from 'react'

export function Example() {
  const [value, setValue] = useState('2')

  return (
    <ListboxRoot value={value} onValueChange={setValue} loop>
      <ListboxLabel>Choose an option</ListboxLabel>
      <ListboxContent>
        <ListboxItem value="1">Option 1</ListboxItem>
        <ListboxItem value="2">Option 2</ListboxItem>
        <ListboxItem value="3" disabled>Option 3</ListboxItem>
      </ListboxContent>
    </ListboxRoot>
  )
}
```

### Multiple selection

```tsx
<ListboxRoot multiple value={values} onValueChange={setValues}>
  <ListboxLabel>Choose options</ListboxLabel>
  <ListboxContent>
    <ListboxItem value="1">Option 1</ListboxItem>
    <ListboxItem value="2">Option 2</ListboxItem>
    <ListboxItem value="3">Option 3</ListboxItem>
  </ListboxContent>
</ListboxRoot>
```

### Grouped options

```tsx
<ListboxRoot value={fruit} onValueChange={setFruit}>
  <ListboxLabel>Choose a fruit</ListboxLabel>
  <ListboxContent>
    <ListboxGroup>
      <ListboxGroupLabel>Citrus</ListboxGroupLabel>
      <ListboxItem value="orange">Orange</ListboxItem>
      <ListboxItem value="lemon">Lemon</ListboxItem>
    </ListboxGroup>
    <ListboxGroup>
      <ListboxGroupLabel>Other</ListboxGroupLabel>
      <ListboxItem value="apple">Apple</ListboxItem>
    </ListboxGroup>
  </ListboxContent>
</ListboxRoot>
```

## API

### Components

- `ListboxRoot` (`Listbox` alias)
- `ListboxContent` (`ListboxList` alias)
- `ListboxItem` (`ListboxOption` alias)
- `ListboxLabel`
- `ListboxGroup`
- `ListboxGroupLabel`

### `ListboxRoot` props

- `multiple?: boolean`
- `value?: string | string[]`
- `defaultValue?: string | string[]`
- `onValueChange?: (value) => void`
- `disabled?: boolean`
- `readOnly?: boolean`
- `loop?: boolean`
- `required?: boolean`
- `orientation?: 'vertical' | 'horizontal'`

## Keyboard & Accessibility

`ListboxContent` renders `role="listbox"` and items render `role="option"`.

- Arrow keys navigate active option (`Up/Down` for vertical, `Left/Right` for horizontal)
- `Home` and `End` jump to first/last enabled option
- Single-select: `Enter` and `Space` select active option
- Multi-select: `Space` toggles active option, `Ctrl/Cmd + A` selects all enabled options
- Disabled options are skipped during keyboard navigation

## Styling Hooks

- Listbox content:
  - `data-disabled`
  - `data-orientation="vertical|horizontal"`
- Listbox item:
  - `data-state="checked|unchecked"`
  - `data-highlighted`
  - `data-disabled`

## License

[MIT](../../LICENSE) License © [Clover You](https://github.com/clovu)
