# react-listbox-primitives

Accessible listbox primitives for React.

## Playground

<https://react-listbox-playground.vercel.app/>

## Features

- Single and multiple selection modes
- Controlled and uncontrolled value state
- APG-style keyboard navigation (Arrow, Home, End, Enter, Space, typeahead, Shift range, Ctrl/Cmd+A)
- Group and group-label semantics
- `readOnly`, `disabled`, `required`, `orientation`, `loop`, and `selectionFollowsFocus` support
- Composable primitives via `asChild`
- Styling via stable data attributes

## Installation

```bash
pnpm add react-listbox-primitives
```

## Usage

```tsx
import { useState } from 'react'
import {
  ListboxContent,
  ListboxItem,
  ListboxLabel,
  ListboxRoot,
} from 'react-listbox-primitives'

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
- `selectionFollowsFocus?: boolean` - defaults to `true`; set to `false` to require Space or Enter before a single-select value changes.

### `ListboxItem` props

- `value: string`
- `disabled?: boolean`
- `textValue?: string`
- `asChild?: boolean`

Use `textValue` when the option renders icons, abbreviations, or other children whose text content is not the desired typeahead search string.

## Keyboard & Accessibility

`ListboxContent` renders `role="listbox"` and items render `role="option"`.

- Arrow keys move the active option and skip disabled options
- Horizontal listboxes also accept `ArrowDown` and `ArrowUp` as next/previous aliases
- `Home` and `End` jump to the first/last enabled option
- Printable character keys perform typeahead search
- Single-select: focus movement follows selection by default; set `selectionFollowsFocus={false}` for manual Space/Enter commits
- Multi-select: `Space` toggles the active option, `Shift + Arrow` extends a range, `Ctrl/Cmd + A` toggles all enabled options
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
