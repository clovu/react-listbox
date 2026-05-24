import type { ScenarioId } from '@/lib/playground-data'
import { PLAYGROUND_SCENARIOS } from '@/lib/playground-data'
import { cn } from '@/lib/utils'
import { DemoCard } from './demo-card'

interface ScenarioRailProps {
  activeScenarioId: ScenarioId
  onChange: (id: ScenarioId) => void
}

export function ScenarioRail({ activeScenarioId, onChange }: ScenarioRailProps) {
  return (
    <DemoCard title="Scenarios" description="Switch the model and reset the lab surface." size="sm">
      <div className="flex flex-col gap-1">
        {PLAYGROUND_SCENARIOS.map((scenario) => {
          const isActive = scenario.id === activeScenarioId

          return (
            <button
              key={scenario.id}
              type="button"
              className={cn(
                'flex min-h-14 items-center justify-between gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive && 'bg-accent text-accent-foreground',
              )}
              onClick={() => onChange(scenario.id)}
              aria-pressed={isActive}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{scenario.title}</span>
                <span className="block truncate text-xs text-muted-foreground">{scenario.signal}</span>
              </span>
              <span className="rounded-md border bg-background px-2 py-1 text-[0.6875rem] font-medium text-muted-foreground">
                {scenario.mode === 'multiple' ? 'Multi' : 'Single'}
              </span>
            </button>
          )
        })}
      </div>
    </DemoCard>
  )
}
