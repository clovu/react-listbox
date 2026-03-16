import { useEffect, useState } from 'react'
import { DemoCard } from './components/demo-card'
import { ThemeControls } from './components/theme-controls'
import {
  ListboxContent,
  ListboxGroup,
  ListboxGroupLabel,
  ListboxItem,
  ListboxLabel,
  ListboxRoot,
} from './components/ui/listbox'

type ThemePreference = 'light' | 'dark' | 'system'

interface ListboxOption {
  value: string
  label: string
  disabled?: boolean
}

const THEME_STORAGE_KEY = 'playground-theme'

const singleOptions: ListboxOption[] = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3 (Disabled)', disabled: true },
  { value: '4', label: 'Option 4' },
]

const multiOptions: ListboxOption[] = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3' },
  { value: '4', label: 'Option 4' },
]

const readOnlyItems: ListboxOption[] = [
  { value: 'guide-1', label: 'Getting Started' },
  { value: 'guide-2', label: 'Components Overview' },
  { value: 'guide-3', label: 'Accessibility Notes' },
  { value: 'guide-4', label: 'Keyboard Interaction' },
  { value: 'guide-5', label: 'Composition Patterns' },
  { value: 'guide-6', label: 'Styling Recipes' },
  { value: 'guide-7', label: 'State Management' },
  { value: 'guide-8', label: 'Testing Checklist' },
  { value: 'guide-9', label: 'Migration Guide' },
  { value: 'guide-10', label: 'FAQ' },
  { value: 'guide-11', label: 'Performance Tips' },
  { value: 'guide-12', label: 'Troubleshooting' },
]

function isThemePreference(value: string): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system'
}

function App() {
  const [singleValue, setSingleValue] = useState('2')
  const [multiValues, setMultiValues] = useState<string[]>(['1', '3'])
  const [groupedValue, setGroupedValue] = useState('apple')
  const [themePreference, setThemePreference] = useState<ThemePreference>(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    return stored && isThemePreference(stored) ? stored : 'system'
  })

  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const applyTheme = () => {
      const shouldUseDark = themePreference === 'dark' || (themePreference === 'system' && media.matches)
      root.classList.toggle('dark', shouldUseDark)
    }

    applyTheme()
    window.localStorage.setItem(THEME_STORAGE_KEY, themePreference)

    if (themePreference !== 'system') {
      return
    }

    const handleChange = () => {
      applyTheme()
    }

    media.addEventListener('change', handleChange)
    return () => {
      media.removeEventListener('change', handleChange)
    }
  }, [themePreference])

  return (
    <main className="min-h-screen bg-linear-to-b from-background to-muted/30 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4">
        <section className="space-y-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight">Listbox Primitives Playground</h1>
              <p className="text-sm text-muted-foreground md:text-base">
                Validate single select, multi select, grouped options, disabled options, and keyboard
                interaction.
              </p>
            </div>

            <ThemeControls themePreference={themePreference} onChange={setThemePreference} />
          </div>
        </section>

        <DemoCard
          title="Single Select Listbox (Loop)"
          footer={(
            <div className="text-sm text-muted-foreground">
              Current value:
              {' '}
              <span className="font-medium text-foreground">{singleValue}</span>
            </div>
          )}
        >
          <ListboxRoot value={singleValue} onValueChange={setSingleValue} loop>
            <ListboxLabel>Select one option</ListboxLabel>
            <ListboxContent>
              {singleOptions.map(option => (
                <ListboxItem key={option.value} value={option.value} disabled={option.disabled}>
                  {option.label}
                </ListboxItem>
              ))}
            </ListboxContent>
          </ListboxRoot>
        </DemoCard>

        <DemoCard
          title="Multi Select Listbox"
          footer={(
            <div className="text-sm text-muted-foreground">
              Current value:
              {' '}
              <span className="font-medium text-foreground">{multiValues.join(', ') || 'none'}</span>
            </div>
          )}
        >
          <ListboxRoot multiple value={multiValues} onValueChange={setMultiValues}>
            <ListboxLabel>Select multiple options</ListboxLabel>
            <ListboxContent>
              {multiOptions.map(option => (
                <ListboxItem key={option.value} value={option.value}>
                  {option.label}
                </ListboxItem>
              ))}
            </ListboxContent>
          </ListboxRoot>
        </DemoCard>

        <DemoCard
          title="Grouped Listbox"
          footer={(
            <div className="text-sm text-muted-foreground">
              Current value:
              {' '}
              <span className="font-medium text-foreground">{groupedValue}</span>
            </div>
          )}
        >
          <ListboxRoot value={groupedValue} onValueChange={setGroupedValue}>
            <ListboxLabel>Select a fruit</ListboxLabel>
            <ListboxContent>
              <ListboxGroup className="mb-2 last:mb-0">
                <ListboxGroupLabel className="px-3 py-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Citrus
                </ListboxGroupLabel>
                <ListboxItem value="orange">Orange</ListboxItem>
                <ListboxItem value="lemon">Lemon</ListboxItem>
              </ListboxGroup>

              <ListboxGroup className="mb-2 last:mb-0">
                <ListboxGroupLabel className="px-3 py-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Other
                </ListboxGroupLabel>
                <ListboxItem value="apple">Apple</ListboxItem>
                <ListboxItem value="banana">Banana</ListboxItem>
              </ListboxGroup>
            </ListboxContent>
          </ListboxRoot>
        </DemoCard>

        <DemoCard
          title="Read-only Listbox"
          footer={<div className="text-sm text-muted-foreground">Note: this list is read-only and cannot change selection.</div>}
        >
          <ListboxRoot readOnly loop>
            <ListboxLabel>Read-only list</ListboxLabel>
            <ListboxContent className="max-h-72">
              {readOnlyItems.map(item => (
                <ListboxItem key={item.value} value={item.value}>
                  {item.label}
                </ListboxItem>
              ))}
            </ListboxContent>
          </ListboxRoot>
        </DemoCard>

        <DemoCard title="Keyboard Checklist">
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Single select: Arrow / Home / End automatically update the selected option.</li>
            <li>Multi select: Arrow only moves focus, Space toggles, Ctrl/Cmd + A selects all.</li>
            <li>Disabled options cannot be selected and are skipped during keyboard navigation.</li>
          </ul>
        </DemoCard>
      </div>
    </main>
  )
}

export default App
