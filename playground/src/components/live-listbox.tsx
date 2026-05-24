import type { RefObject } from 'react'
import type { PlaygroundGroup, PlaygroundOption, PlaygroundScenario, PlaygroundSettings } from '@/lib/playground-data'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ListboxContent,
  ListboxGroup,
  ListboxGroupLabel,
  ListboxItem,
  ListboxLabel,
  ListboxRoot,
} from './ui/listbox'

interface LiveListboxProps {
  listboxRef: RefObject<HTMLDivElement | null>
  multiValues: string[]
  onMultiValuesChange: (values: string[]) => void
  onSingleValueChange: (value: string) => void
  scenario: PlaygroundScenario
  settings: PlaygroundSettings
  singleValue: string
}

interface OptionRowProps {
  isSelected: boolean
  option: PlaygroundOption
  orientation: PlaygroundSettings['orientation']
}

function OptionRow({ isSelected, option, orientation }: OptionRowProps) {
  return (
    <ListboxItem
      value={option.value}
      disabled={option.disabled}
      textValue={option.textValue}
      data-label={option.label}
      className={cn(orientation === 'horizontal' && 'min-w-48 flex-1')}
    >
      <span className={cn('grid size-5 shrink-0 place-items-center rounded border text-primary transition-colors', isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-transparent')}>
        <Check className="size-3.5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{option.label}</span>
        {option.detail ? <span className="block truncate text-xs text-muted-foreground">{option.detail}</span> : null}
      </span>
      {option.meta
        ? (
            <span className="shrink-0 rounded-md border bg-background px-2 py-1 text-[0.6875rem] font-medium text-muted-foreground">
              {option.meta}
            </span>
          )
        : null}
    </ListboxItem>
  )
}

function renderGroup(
  group: PlaygroundGroup,
  selectedValues: Set<string>,
  orientation: PlaygroundSettings['orientation'],
  showGroupLabel: boolean,
) {
  const options = group.options.map(option => (
    <OptionRow
      key={option.value}
      option={option}
      orientation={orientation}
      isSelected={selectedValues.has(option.value)}
    />
  ))

  if (!showGroupLabel)
    return options

  return (
    <ListboxGroup key={group.label} className="flex flex-col gap-1">
      <ListboxGroupLabel className="px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">
        {group.label}
      </ListboxGroupLabel>
      {options}
    </ListboxGroup>
  )
}

export function LiveListbox({
  listboxRef,
  multiValues,
  onMultiValuesChange,
  onSingleValueChange,
  scenario,
  settings,
  singleValue,
}: LiveListboxProps) {
  const selectedValues = new Set(scenario.mode === 'multiple' ? multiValues : [singleValue])
  const showGroupLabel = scenario.groups.length > 1
  const contentClassName = cn(
    'min-h-72',
    settings.orientation === 'horizontal' ? 'min-h-0 flex-wrap' : 'max-h-[26rem]',
  )

  if (scenario.mode === 'multiple') {
    return (
      <ListboxRoot
        multiple
        value={multiValues}
        onValueChange={onMultiValuesChange}
        disabled={settings.disabled}
        readOnly={settings.readOnly}
        loop={settings.loop}
        required={settings.required}
        orientation={settings.orientation}
      >
        <ListboxLabel>{scenario.title}</ListboxLabel>
        <ListboxContent ref={listboxRef} className={contentClassName}>
          {scenario.groups.map(group => renderGroup(group, selectedValues, settings.orientation, showGroupLabel))}
        </ListboxContent>
      </ListboxRoot>
    )
  }

  return (
    <ListboxRoot
      value={singleValue}
      onValueChange={onSingleValueChange}
      disabled={settings.disabled}
      readOnly={settings.readOnly}
      loop={settings.loop}
      required={settings.required}
      orientation={settings.orientation}
      selectionFollowsFocus={settings.selectionFollowsFocus}
    >
      <ListboxLabel>{scenario.title}</ListboxLabel>
      <ListboxContent ref={listboxRef} className={contentClassName}>
        {scenario.groups.map(group => renderGroup(group, selectedValues, settings.orientation, showGroupLabel))}
      </ListboxContent>
    </ListboxRoot>
  )
}
