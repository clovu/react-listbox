import type { Orientation } from './types'

export interface ListboxOptionRecord {
  /**
   * Stable option value used for selection and active-descendant lookup.
   */
  value: string
  /**
   * Whether this option is skipped by keyboard navigation and bulk selection.
   */
  disabled: boolean
  /**
   * Searchable text used by typeahead when rendered text is not sufficient.
   */
  textValue: string
  /**
   * DOM id used by `aria-activedescendant`.
   */
  id: string
}

/**
 * Selected value shape for single- and multi-select listboxes.
 */
export type ListboxSelection = string | string[]

const TYPEAHEAD_RESET_DELAY = 700
const WHITESPACE_RE = /^\s$/u

function isTextMatch(source: string, query: string) {
  if (!query)
    return false

  return normalizeText(source).startsWith(normalizeText(query))
}

function normalizeText(value: string) {
  return value
    .trim()
    .toLocaleLowerCase()
    .normalize('NFKD')
}

export function getEnabledItems(items: ListboxOptionRecord[]) {
  return items.filter(item => !item.disabled)
}

export function getSelectedValues(value: ListboxSelection, multiple: boolean) {
  return multiple ? (Array.isArray(value) ? value : []) : (typeof value === 'string' && value ? [value] : [])
}

export function getSelectedValue(value: ListboxSelection, multiple: boolean) {
  return getSelectedValues(value, multiple)[0] ?? null
}

export function getSelectedSet(value: ListboxSelection, multiple: boolean) {
  return new Set(getSelectedValues(value, multiple))
}

export function getFirstEnabledValue(items: ListboxOptionRecord[]) {
  return getEnabledItems(items)[0]?.value ?? null
}

export function getActiveValueFallback(
  items: ListboxOptionRecord[],
  value: ListboxSelection,
  multiple: boolean,
) {
  return getSelectedValue(value, multiple) ?? getFirstEnabledValue(items)
}

export function getNextEnabledValue(
  items: ListboxOptionRecord[],
  currentValue: string | null,
  direction: 'next' | 'previous',
  loop: boolean,
) {
  const enabledItems = getEnabledItems(items)

  if (enabledItems.length === 0)
    return null

  const currentIndex = enabledItems.findIndex(item => item.value === currentValue)

  if (currentIndex === -1)
    return direction === 'next' ? enabledItems[0].value : enabledItems.at(-1)!.value

  const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1

  if (nextIndex >= 0 && nextIndex < enabledItems.length)
    return enabledItems[nextIndex].value

  if (!loop)
    return currentValue

  return direction === 'next' ? enabledItems[0].value : enabledItems.at(-1)!.value
}

export function moveValueWithBoundary(
  items: ListboxOptionRecord[],
  edge: 'first' | 'last',
) {
  const enabledItems = getEnabledItems(items)

  if (enabledItems.length === 0)
    return null

  return edge === 'first' ? enabledItems[0].value : enabledItems.at(-1)!.value
}

export function getOrientationKeyAliases(orientation: Orientation) {
  // APG allows horizontal listboxes to accept vertical arrow keys as aliases.
  return orientation === 'horizontal'
    ? {
        next: new Set(['ArrowRight', 'ArrowDown']),
        previous: new Set(['ArrowLeft', 'ArrowUp']),
      }
    : {
        next: new Set(['ArrowDown']),
        previous: new Set(['ArrowUp']),
      }
}

export function isPrintableKey(eventKey: string) {
  return eventKey.length === 1 && !WHITESPACE_RE.test(eventKey)
}

export function getTypeaheadValue(
  items: ListboxOptionRecord[],
  currentValue: string | null,
  searchValue: string,
) {
  // Search starts after the active option so repeated keys cycle through matches.
  const enabledItems = getEnabledItems(items)

  if (enabledItems.length === 0)
    return null

  const normalizedSearchValue = normalizeText(searchValue)
  const startIndex = Math.max(
    enabledItems.findIndex(item => item.value === currentValue),
    0,
  )

  for (let offset = 1; offset <= enabledItems.length; offset += 1) {
    const item = enabledItems[(startIndex + offset) % enabledItems.length]
    if (isTextMatch(item.textValue || item.value, normalizedSearchValue))
      return item.value
  }

  return null
}

export function toggleSelectedValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter(item => item !== value)
    : [...values, value]
}

export function getEnabledValues(items: ListboxOptionRecord[]) {
  return getEnabledItems(items).map(item => item.value)
}

export function hasSelectedAllEnabledValues(items: ListboxOptionRecord[], selectedValues: string[]) {
  const enabledValues = getEnabledValues(items)
  return enabledValues.length > 0 && enabledValues.every(value => selectedValues.includes(value))
}

export function selectAllEnabledValues(items: ListboxOptionRecord[]) {
  return getEnabledValues(items)
}

export function clearSelectedValues() {
  return [] as string[]
}

export function getRangeValues(
  items: ListboxOptionRecord[],
  fromValue: string,
  toValue: string,
) {
  const enabledItems = getEnabledItems(items)
  const fromIndex = enabledItems.findIndex(item => item.value === fromValue)
  const toIndex = enabledItems.findIndex(item => item.value === toValue)

  if (fromIndex === -1 || toIndex === -1)
    return [] as string[]

  const start = Math.min(fromIndex, toIndex)
  const end = Math.max(fromIndex, toIndex)

  return enabledItems.slice(start, end + 1).map(item => item.value)
}

export function getTypeaheadResetDelay() {
  return TYPEAHEAD_RESET_DELAY
}
