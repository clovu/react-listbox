import type { PlaygroundScenario, PlaygroundSettings } from '@/lib/playground-data'
import { ArrowDown, ArrowRight, Check, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DemoCard } from './demo-card'

interface SettingsPanelProps {
  scenario: PlaygroundScenario
  settings: PlaygroundSettings
  onReset: () => void
  onSettingsChange: (settings: PlaygroundSettings) => void
}

interface ToggleFieldProps {
  checked: boolean
  disabled?: boolean
  label: string
  meta: string
  onChange: (checked: boolean) => void
}

function ToggleField({ checked, disabled, label, meta, onChange }: ToggleFieldProps) {
  return (
    <label className={cn('flex cursor-pointer items-center gap-3 rounded-md border bg-background p-3', disabled && 'cursor-not-allowed opacity-55')}>
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        onChange={event => onChange(event.currentTarget.checked)}
      />
      <span className="grid size-5 shrink-0 place-items-center rounded border border-input bg-background text-primary transition-colors peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
        <Check className={cn('size-3.5', checked ? 'opacity-100' : 'opacity-0')} aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium leading-none">{label}</span>
        <span className="mt-1 block text-xs text-muted-foreground">{meta}</span>
      </span>
    </label>
  )
}

export function SettingsPanel({ scenario, settings, onReset, onSettingsChange }: SettingsPanelProps) {
  const update = (patch: Partial<PlaygroundSettings>) => onSettingsChange({ ...settings, ...patch })

  return (
    <DemoCard
      title="Controls"
      description="Every switch feeds the live primitive."
      size="sm"
      action={(
        <button
          type="button"
          className="inline-flex size-8 items-center justify-center rounded-md border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={onReset}
          aria-label="Reset scenario"
          title="Reset scenario"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
        </button>
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="flex rounded-lg border bg-background p-1">
          {[
            { value: 'vertical', label: 'Vertical', icon: ArrowDown },
            { value: 'horizontal', label: 'Horizontal', icon: ArrowRight },
          ].map((option) => {
            const isActive = settings.orientation === option.value
            const Icon = option.icon

            return (
              <button
                key={option.value}
                type="button"
                className={cn(
                  'inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive && 'bg-primary text-primary-foreground hover:text-primary-foreground',
                )}
                onClick={() => update({ orientation: option.value as PlaygroundSettings['orientation'] })}
                aria-pressed={isActive}
              >
                <Icon className="size-4" aria-hidden="true" />
                {option.label}
              </button>
            )
          })}
        </div>

        <ToggleField
          checked={settings.loop}
          label="Loop"
          meta="Wrap boundary navigation"
          onChange={loop => update({ loop })}
        />
        <ToggleField
          checked={settings.selectionFollowsFocus}
          disabled={scenario.mode === 'multiple'}
          label="Selection follows focus"
          meta={scenario.mode === 'multiple' ? 'Single select only' : 'Arrow keys commit value'}
          onChange={selectionFollowsFocus => update({ selectionFollowsFocus })}
        />
        <ToggleField
          checked={settings.required}
          label="Required"
          meta="Prevent empty manual commit"
          onChange={required => update({ required })}
        />
        <ToggleField
          checked={settings.readOnly}
          label="Read-only"
          meta="Focus moves, value is locked"
          onChange={readOnly => update({ readOnly })}
        />
        <ToggleField
          checked={settings.disabled}
          label="Disabled"
          meta="Remove the listbox from tab flow"
          onChange={disabled => update({ disabled })}
        />
      </div>
    </DemoCard>
  )
}
