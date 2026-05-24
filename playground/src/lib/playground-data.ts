import type { Orientation } from 'react-listbox-primitives'

export type ScenarioId = 'single' | 'multi' | 'grouped' | 'horizontal' | 'readonly' | 'disabled'
export type ScenarioMode = 'single' | 'multiple'

export interface PlaygroundSettings {
  disabled: boolean
  loop: boolean
  orientation: Orientation
  readOnly: boolean
  required: boolean
  selectionFollowsFocus: boolean
}

export interface PlaygroundOption {
  value: string
  label: string
  detail?: string
  meta?: string
  disabled?: boolean
  textValue?: string
}

export interface PlaygroundGroup {
  label: string
  options: PlaygroundOption[]
}

export interface PlaygroundScenario {
  id: ScenarioId
  title: string
  summary: string
  mode: ScenarioMode
  signal: string
  groups: PlaygroundGroup[]
  initialValue: string | string[]
  defaultSettings: PlaygroundSettings
}

export const BASE_SETTINGS: PlaygroundSettings = {
  disabled: false,
  loop: true,
  orientation: 'vertical',
  readOnly: false,
  required: false,
  selectionFollowsFocus: true,
}

export const PLAYGROUND_SCENARIOS: PlaygroundScenario[] = [
  {
    id: 'single',
    title: 'Single select',
    summary: 'Manual commit, disabled option, and typeahead in one controlled listbox.',
    mode: 'single',
    signal: 'Commit',
    initialValue: 'queued',
    defaultSettings: {
      ...BASE_SETTINGS,
      selectionFollowsFocus: false,
    },
    groups: [
      {
        label: 'Pipeline',
        options: [
          { value: 'proposed', label: 'Proposed', detail: 'Captured but not scheduled', meta: 'P0' },
          { value: 'queued', label: 'Queued', detail: 'Ready for the next pass', meta: 'P1' },
          { value: 'active', label: 'In progress', detail: 'Currently being implemented', meta: 'Live' },
          { value: 'blocked', label: 'Blocked', detail: 'Skipped by keyboard navigation', meta: 'Hold', disabled: true },
          { value: 'shipped', label: 'Shipped', detail: 'Merged and verified', meta: 'Done' },
        ],
      },
    ],
  },
  {
    id: 'multi',
    title: 'Multi select',
    summary: 'Independent focus and selection with range and select-all behavior.',
    mode: 'multiple',
    signal: 'Batch',
    initialValue: ['docs', 'tests'],
    defaultSettings: {
      ...BASE_SETTINGS,
      selectionFollowsFocus: false,
    },
    groups: [
      {
        label: 'Release gates',
        options: [
          { value: 'api', label: 'API review', detail: 'Public props and event contracts', meta: 'Spec' },
          { value: 'a11y', label: 'Accessibility pass', detail: 'Roles, labels, and keyboard flow', meta: 'APG' },
          { value: 'docs', label: 'Docs update', detail: 'README examples and API notes', meta: 'Docs' },
          { value: 'tests', label: 'Interaction tests', detail: 'Pointer, keyboard, and typeahead', meta: 'CI' },
          { value: 'perf', label: 'Performance sample', detail: 'Long list and scroll behavior', meta: 'Lab' },
          { value: 'legacy', label: 'Legacy browser', detail: 'Intentionally unavailable', meta: 'N/A', disabled: true },
        ],
      },
    ],
  },
  {
    id: 'grouped',
    title: 'Grouped options',
    summary: 'Nested groups keep DOM order, group labels, and typeahead working together.',
    mode: 'single',
    signal: 'Groups',
    initialValue: 'radix',
    defaultSettings: BASE_SETTINGS,
    groups: [
      {
        label: 'Primitives',
        options: [
          { value: 'radix', label: 'Radix UI', detail: 'Composable primitive baseline', meta: 'Base' },
          { value: 'ariakit', label: 'Ariakit', detail: 'Headless accessibility toolkit', meta: 'Alt' },
          { value: 'react-aria', label: 'React Aria', detail: 'Adobe interaction model', meta: 'Alt' },
        ],
      },
      {
        label: 'Product surfaces',
        options: [
          { value: 'command', label: 'Command menu', detail: 'Search-heavy chooser', meta: 'Cmd K', textValue: 'Command menu' },
          { value: 'filters', label: 'Filter rail', detail: 'Dense multi-step filtering', meta: 'UI' },
          { value: 'settings', label: 'Settings panel', detail: 'Form-adjacent option picking', meta: 'Form' },
        ],
      },
    ],
  },
  {
    id: 'horizontal',
    title: 'Horizontal listbox',
    summary: 'Orientation-sensitive arrows with the same selection model.',
    mode: 'single',
    signal: 'Axis',
    initialValue: 'comfortable',
    defaultSettings: {
      ...BASE_SETTINGS,
      orientation: 'horizontal',
    },
    groups: [
      {
        label: 'Density',
        options: [
          { value: 'compact', label: 'Compact', detail: 'Dense repeated work', meta: '32px' },
          { value: 'comfortable', label: 'Comfortable', detail: 'Balanced default', meta: '40px' },
          { value: 'spacious', label: 'Spacious', detail: 'Review and touch targets', meta: '48px' },
        ],
      },
    ],
  },
  {
    id: 'readonly',
    title: 'Read-only audit',
    summary: 'Focus can move through options while selected value stays locked.',
    mode: 'single',
    signal: 'Locked',
    initialValue: 'stable',
    defaultSettings: {
      ...BASE_SETTINGS,
      readOnly: true,
    },
    groups: [
      {
        label: 'Channels',
        options: [
          { value: 'alpha', label: 'Alpha', detail: 'Internal experiments', meta: 'Low' },
          { value: 'beta', label: 'Beta', detail: 'Partner validation', meta: 'Med' },
          { value: 'stable', label: 'Stable', detail: 'Published default', meta: 'High' },
          { value: 'deprecated', label: 'Deprecated', detail: 'Visible but no longer picked', meta: 'Old' },
        ],
      },
    ],
  },
  {
    id: 'disabled',
    title: 'Disabled root',
    summary: 'Whole-list disabled state for form and loading boundaries.',
    mode: 'single',
    signal: 'Form',
    initialValue: 'starter',
    defaultSettings: {
      ...BASE_SETTINGS,
      disabled: true,
    },
    groups: [
      {
        label: 'Plans',
        options: [
          { value: 'starter', label: 'Starter', detail: 'Basic primitives and local usage', meta: 'Free' },
          { value: 'team', label: 'Team', detail: 'Shared design system wrappers', meta: 'Team' },
          { value: 'enterprise', label: 'Enterprise', detail: 'Policy and audit workflows', meta: 'Org' },
        ],
      },
    ],
  },
]

export function getScenarioById(id: ScenarioId) {
  return PLAYGROUND_SCENARIOS.find(scenario => scenario.id === id) ?? PLAYGROUND_SCENARIOS[0]
}

export function getScenarioOptions(scenario: PlaygroundScenario) {
  return scenario.groups.flatMap(group => group.options)
}

export function getSingleInitialValue(scenario: PlaygroundScenario) {
  return typeof scenario.initialValue === 'string'
    ? scenario.initialValue
    : scenario.initialValue[0] ?? ''
}

export function getMultiInitialValue(scenario: PlaygroundScenario) {
  return Array.isArray(scenario.initialValue)
    ? scenario.initialValue
    : scenario.initialValue ? [scenario.initialValue] : []
}
