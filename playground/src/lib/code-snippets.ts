import type { PlaygroundOption, PlaygroundScenario, PlaygroundSettings } from './playground-data'

function getRootProps(scenario: PlaygroundScenario, settings: PlaygroundSettings) {
  const props = scenario.mode === 'multiple'
    ? ['multiple', 'value={values}', 'onValueChange={setValues}']
    : ['value={value}', 'onValueChange={setValue}']

  if (settings.loop)
    props.push('loop')
  if (settings.disabled)
    props.push('disabled')
  if (settings.readOnly)
    props.push('readOnly')
  if (settings.required)
    props.push('required')
  if (settings.orientation === 'horizontal')
    props.push('orientation="horizontal"')
  if (scenario.mode === 'single' && !settings.selectionFollowsFocus)
    props.push('selectionFollowsFocus={false}')

  return props
}

function renderRootOpening(scenario: PlaygroundScenario, settings: PlaygroundSettings) {
  const props = getRootProps(scenario, settings)

  if (props.length <= 3)
    return `<ListboxRoot ${props.join(' ')}>`

  return [
    '<ListboxRoot',
    ...props.map(prop => `  ${prop}`),
    '>',
  ].join('\n')
}

function renderOption(option: PlaygroundOption, indent = '      ') {
  const props = [`value="${option.value}"`]

  if (option.disabled)
    props.push('disabled')
  if (option.textValue)
    props.push(`textValue="${option.textValue}"`)

  return `${indent}<ListboxItem ${props.join(' ')}>${option.label}</ListboxItem>`
}

function renderOptions(scenario: PlaygroundScenario) {
  if (scenario.groups.length === 1)
    return scenario.groups[0].options.map(option => renderOption(option, '      ')).join('\n')

  return scenario.groups.map(group => [
    '      <ListboxGroup>',
    `        <ListboxGroupLabel>${group.label}</ListboxGroupLabel>`,
    ...group.options.map(option => renderOption(option, '        ')),
    '      </ListboxGroup>',
  ].join('\n')).join('\n')
}

export function createScenarioSnippet(scenario: PlaygroundScenario, settings: PlaygroundSettings) {
  const imports = scenario.groups.length > 1
    ? '  ListboxGroup,\n  ListboxGroupLabel,\n'
    : ''

  return `import {
  ListboxContent,
${imports}  ListboxItem,
  ListboxLabel,
  ListboxRoot,
} from 'react-listbox-primitives'

${renderRootOpening(scenario, settings)}
  <ListboxLabel>${scenario.title}</ListboxLabel>
  <ListboxContent>
${renderOptions(scenario)}
  </ListboxContent>
</ListboxRoot>`
}
