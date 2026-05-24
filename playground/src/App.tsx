import type { ThemePreference } from './components/theme-controls'
import type { ScenarioId } from './lib/playground-data'
import { Settings2 } from 'lucide-react'
import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { CodeBlock } from './components/code-block'
import { DemoCard } from './components/demo-card'
import { KeyboardMatrix } from './components/keyboard-matrix'
import { LiveListbox } from './components/live-listbox'
import { ScenarioRail } from './components/scenario-rail'
import { SettingsPanel } from './components/settings-panel'
import { StatGrid } from './components/stat-grid'
import { StateInspector } from './components/state-inspector'
import { ThemeControls } from './components/theme-controls'
import { createScenarioSnippet } from './lib/code-snippets'
import { createLabState, labReducer } from './lib/lab-state'
import { EMPTY_SNAPSHOT, readListboxSnapshot, snapshotReducer } from './lib/listbox-snapshot'
import { getScenarioById } from './lib/playground-data'
import { formatValue } from './lib/value-format'

const THEME_STORAGE_KEY = 'playground-theme'

function isThemePreference(value: string): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system'
}

function getCurrentValue(scenarioMode: 'single' | 'multiple', singleValue: string, multiValues: string[]) {
  return scenarioMode === 'multiple' ? multiValues : singleValue
}

function App() {
  const [labState, dispatchLab] = useReducer(labReducer, 'single', createLabState)
  const [snapshot, updateSnapshot] = useReducer(snapshotReducer, EMPTY_SNAPSHOT)
  const [themePreference, setThemePreference] = useState<ThemePreference>(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    return stored && isThemePreference(stored) ? stored : 'system'
  })
  const listboxRef = useRef<HTMLDivElement>(null)
  const activeScenario = getScenarioById(labState.activeScenarioId)
  const currentValue = getCurrentValue(activeScenario.mode, labState.singleValue, labState.multiValues)
  const snippet = useMemo(() => createScenarioSnippet(activeScenario, labState.settings), [activeScenario, labState.settings])

  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const applyTheme = () => {
      const shouldUseDark = themePreference === 'dark' || (themePreference === 'system' && media.matches)
      root.classList.toggle('dark', shouldUseDark)
    }

    applyTheme()
    window.localStorage.setItem(THEME_STORAGE_KEY, themePreference)

    if (themePreference !== 'system')
      return

    const handleChange = () => applyTheme()
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [themePreference])

  useEffect(() => {
    const node = listboxRef.current

    if (!node)
      return

    const refreshSnapshot = () => updateSnapshot(readListboxSnapshot(node))
    const scheduleRefresh = () => window.requestAnimationFrame(refreshSnapshot)

    refreshSnapshot()

    const observer = new MutationObserver(refreshSnapshot)
    observer.observe(node, {
      attributeFilter: [
        'aria-activedescendant',
        'aria-disabled',
        'aria-multiselectable',
        'aria-orientation',
        'aria-readonly',
        'aria-required',
        'aria-selected',
        'data-highlighted',
        'data-state',
        'data-value',
        'tabindex',
      ],
      attributes: true,
      subtree: true,
    })

    node.addEventListener('click', scheduleRefresh)
    node.addEventListener('keydown', scheduleRefresh)
    node.addEventListener('mousemove', scheduleRefresh)

    return () => {
      observer.disconnect()
      node.removeEventListener('click', scheduleRefresh)
      node.removeEventListener('keydown', scheduleRefresh)
      node.removeEventListener('mousemove', scheduleRefresh)
    }
  }, [labState.activeScenarioId, labState.settings, labState.singleValue, labState.multiValues])

  function selectScenario(scenarioId: ScenarioId) {
    dispatchLab({ type: 'selectScenario', scenarioId })
    updateSnapshot(EMPTY_SNAPSHOT)
  }

  function resetScenario() {
    dispatchLab({ type: 'resetScenario' })
    updateSnapshot(EMPTY_SNAPSHOT)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="mb-2 inline-flex items-center gap-2 rounded-md border bg-muted/40 px-2 py-1 text-xs font-medium text-muted-foreground">
              <Settings2 className="size-3.5" aria-hidden="true" />
              Playground
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              react-listbox-primitives
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              A focused lab for selection state, keyboard behavior, disabled boundaries, and ARIA output.
            </p>
          </div>

          <ThemeControls themePreference={themePreference} onChange={setThemePreference} />
        </header>

        <div className="grid flex-1 gap-4 lg:grid-cols-[17rem_minmax(0,1fr)_22rem]">
          <aside className="flex flex-col gap-4">
            <ScenarioRail activeScenarioId={labState.activeScenarioId} onChange={selectScenario} />
          </aside>

          <section className="flex min-w-0 flex-col gap-4">
            <DemoCard
              title={activeScenario.title}
              description={activeScenario.summary}
              action={(
                <span className="rounded-md border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
                  {formatValue(currentValue)}
                </span>
              )}
            >
              <div className="flex flex-col gap-4">
                <StatGrid scenario={activeScenario} settings={labState.settings} />
                <LiveListbox
                  listboxRef={listboxRef}
                  scenario={activeScenario}
                  settings={labState.settings}
                  singleValue={labState.singleValue}
                  multiValues={labState.multiValues}
                  onSingleValueChange={value => dispatchLab({ type: 'setSingleValue', value })}
                  onMultiValuesChange={values => dispatchLab({ type: 'setMultiValues', values })}
                />
              </div>
            </DemoCard>

            <DemoCard title="Composition" description="The current scenario as primitive code.">
              <CodeBlock code={snippet} />
            </DemoCard>
          </section>

          <aside className="flex flex-col gap-4">
            <SettingsPanel
              scenario={activeScenario}
              settings={labState.settings}
              onReset={resetScenario}
              onSettingsChange={settings => dispatchLab({ type: 'updateSettings', settings })}
            />
            <StateInspector currentValue={currentValue} snapshot={snapshot} />
            <KeyboardMatrix scenario={activeScenario} />
          </aside>
        </div>
      </div>
    </main>
  )
}

export default App
