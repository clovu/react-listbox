import type { PlaygroundScenario } from '@/lib/playground-data'
import { DemoCard } from './demo-card'

interface KeyboardMatrixProps {
  scenario: PlaygroundScenario
}

export function KeyboardMatrix({ scenario }: KeyboardMatrixProps) {
  const keys = scenario.mode === 'multiple'
    ? ['Arrow', 'Home / End', 'Space', 'Shift + Arrow', 'Ctrl / Cmd + A', 'Typeahead']
    : ['Arrow', 'Home / End', 'Space / Enter', 'Typeahead']

  return (
    <DemoCard title="Keys" description="Fast checks for the active scenario." size="sm">
      <div className="flex flex-wrap gap-2">
        {keys.map(key => (
          <kbd key={key} className="rounded-md border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground shadow-xs">
            {key}
          </kbd>
        ))}
      </div>
    </DemoCard>
  )
}
