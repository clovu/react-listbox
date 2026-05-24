import type { PlaygroundScenario, PlaygroundSettings } from '@/lib/playground-data'
import { getScenarioOptions } from '@/lib/playground-data'

interface StatGridProps {
  scenario: PlaygroundScenario
  settings: PlaygroundSettings
}

export function StatGrid({ scenario, settings }: StatGridProps) {
  const options = getScenarioOptions(scenario)
  const items = [
    { label: 'Mode', value: scenario.mode === 'multiple' ? 'Multiple' : 'Single' },
    { label: 'Options', value: String(options.length) },
    { label: 'Disabled', value: String(options.filter(option => option.disabled).length) },
    { label: 'Axis', value: settings.orientation },
  ]

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
      {items.map(item => (
        <div key={item.label} className="rounded-lg border bg-background p-3">
          <div className="text-xs text-muted-foreground">{item.label}</div>
          <div className="mt-1 truncate text-sm font-semibold">{item.value}</div>
        </div>
      ))}
    </div>
  )
}
