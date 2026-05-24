import type { ListboxSnapshot } from '@/lib/listbox-snapshot'
import { formatValue } from '@/lib/value-format'
import { DemoCard } from './demo-card'

interface StateInspectorProps {
  currentValue: string | string[]
  snapshot: ListboxSnapshot
}

export function StateInspector({ currentValue, snapshot }: StateInspectorProps) {
  const rows = [
    ['value', formatValue(currentValue)],
    ['active option', snapshot.activeOption],
    ['selected DOM', snapshot.selectedOptions.length > 0 ? snapshot.selectedOptions.join(', ') : 'none'],
    ['aria-orientation', snapshot.attributes['aria-orientation'] ?? 'vertical'],
    ['aria-multiselectable', snapshot.attributes['aria-multiselectable'] ?? 'false'],
    ['aria-readonly', snapshot.attributes['aria-readonly'] ?? 'false'],
    ['aria-disabled', snapshot.attributes['aria-disabled'] ?? 'false'],
    ['aria-required', snapshot.attributes['aria-required'] ?? 'false'],
    ['tabIndex', snapshot.attributes.tabIndex ?? '0'],
    ['data-value', snapshot.attributes['data-value'] ?? 'none'],
  ]

  return (
    <DemoCard title="State" description="Controlled value and rendered attributes." size="sm">
      <dl className="flex flex-col divide-y text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[8rem_minmax(0,1fr)] gap-3 py-2 first:pt-0 last:pb-0">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="min-w-0 truncate font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </DemoCard>
  )
}
