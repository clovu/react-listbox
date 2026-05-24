import type { Orientation } from './types'

/**
 * Direction used for one-step keyboard navigation.
 */
export type NavigationDirection = 'next' | 'previous'

/**
 * Boundary target used by Home and End navigation.
 */
export type NavigationBoundary = 'first' | 'last'

type OrientationKeyAliases = Readonly<Record<NavigationDirection, ReadonlySet<string>>>

export interface OptionRecord {
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
export type SelectionValue = string | string[]

export interface KeyboardEventLike {
  /**
   * Keyboard event key value.
   */
  key: string
  /**
   * Whether the Alt modifier is pressed.
   */
  altKey: boolean
  /**
   * Whether the Ctrl modifier is pressed.
   */
  ctrlKey: boolean
  /**
   * Whether the Meta modifier is pressed.
   */
  metaKey: boolean
  /**
   * Whether the Shift modifier is pressed.
   */
  shiftKey: boolean
}

export interface KeyboardActionOptions {
  /**
   * Whether the listbox accepts more than one selected option.
   */
  multiple: boolean
  /**
   * Direction used to interpret arrow-key navigation.
   */
  orientation: Orientation
}

interface MoveKeyboardAction {
  /**
   * Moves active focus by one enabled option.
   */
  type: 'move'
  /**
   * Direction of movement through enabled options.
   */
  direction: NavigationDirection
  /**
   * Whether multi-select range selection should be extended.
   */
  extendSelection: boolean
}

interface BoundaryKeyboardAction {
  /**
   * Moves active focus to the first or last enabled option.
   */
  type: 'boundary'
  /**
   * Boundary edge to target.
   */
  edge: NavigationBoundary
  /**
   * Whether multi-select range selection should be extended.
   */
  extendSelection: boolean
}

interface ToggleKeyboardAction {
  /**
   * Toggles the active option.
   */
  type: 'toggle'
  /**
   * Whether multi-select range selection should be extended.
   */
  extendSelection: boolean
}

interface CommitKeyboardAction {
  /**
   * Commits the active option in single-select mode.
   */
  type: 'commit'
}

interface ToggleAllKeyboardAction {
  /**
   * Toggles all enabled options in multi-select mode.
   */
  type: 'toggleAll'
}

interface TypeaheadKeyboardAction {
  /**
   * Runs printable-key typeahead.
   */
  type: 'typeahead'
  /**
   * Printable key added to the typeahead buffer.
   */
  key: string
}

interface NoopKeyboardAction {
  /**
   * Represents a keyboard event the listbox does not handle.
   */
  type: 'none'
}

export type KeyboardAction
  = | BoundaryKeyboardAction
    | CommitKeyboardAction
    | MoveKeyboardAction
    | NoopKeyboardAction
    | ToggleAllKeyboardAction
    | ToggleKeyboardAction
    | TypeaheadKeyboardAction

const TYPEAHEAD_RESET_DELAY = 700
const WHITESPACE_RE = /^\s$/u
const VERTICAL_KEY_ALIASES: OrientationKeyAliases = {
  next: new Set(['ArrowDown']),
  previous: new Set(['ArrowUp']),
}
const HORIZONTAL_KEY_ALIASES: OrientationKeyAliases = {
  next: new Set(['ArrowRight', 'ArrowDown']),
  previous: new Set(['ArrowLeft', 'ArrowUp']),
}

function isEnabledItem(item: OptionRecord) {
  return !item.disabled
}

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

export function getEnabledItems(items: OptionRecord[]) {
  return items.filter(isEnabledItem)
}

export function hasEnabledItems(items: OptionRecord[]) {
  return items.some(isEnabledItem)
}

export function getItemByValue<T extends OptionRecord>(items: T[], value: string | null) {
  if (!value)
    return null

  return items.find(item => item.value === value) ?? null
}

export function getSelectedValues(value: SelectionValue, multiple: boolean) {
  return multiple ? (Array.isArray(value) ? value : []) : (typeof value === 'string' && value ? [value] : [])
}

export function getSelectedValue(value: SelectionValue, multiple: boolean) {
  return getSelectedValues(value, multiple)[0] ?? null
}

export function getSelectedSet(value: SelectionValue, multiple: boolean) {
  return new Set(getSelectedValues(value, multiple))
}

export function getFirstEnabledValue(items: OptionRecord[]) {
  return items.find(isEnabledItem)?.value ?? null
}

function getLastEnabledValue(items: OptionRecord[]) {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (isEnabledItem(items[index]))
      return items[index].value
  }

  return null
}

export function getActiveValueFallback(
  items: OptionRecord[],
  value: SelectionValue,
  multiple: boolean,
) {
  return getSelectedValue(value, multiple) ?? getFirstEnabledValue(items)
}

export function getNextEnabledValue(
  items: OptionRecord[],
  currentValue: string | null,
  direction: NavigationDirection,
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
  items: OptionRecord[],
  edge: NavigationBoundary,
) {
  return edge === 'first' ? getFirstEnabledValue(items) : getLastEnabledValue(items)
}

export function getOrientationKeyAliases(orientation: Orientation) {
  // APG allows horizontal listboxes to accept vertical arrow keys as aliases.
  return orientation === 'horizontal' ? HORIZONTAL_KEY_ALIASES : VERTICAL_KEY_ALIASES
}

export function isPrintableKey(eventKey: string) {
  return eventKey.length === 1 && !WHITESPACE_RE.test(eventKey)
}

export function getTypeaheadValue(
  items: OptionRecord[],
  currentValue: string | null,
  searchValue: string,
) {
  // Search starts after the active option so repeated keys cycle through matches.
  const enabledItems = getEnabledItems(items)

  if (enabledItems.length === 0)
    return null

  const normalizedSearchValue = normalizeText(searchValue)
  const startIndex = enabledItems.findIndex(item => item.value === currentValue)

  for (let offset = 1; offset <= enabledItems.length; offset += 1) {
    const item = enabledItems[(startIndex + offset) % enabledItems.length]
    if (isTextMatch(item.textValue || item.value, normalizedSearchValue))
      return item.value
  }

  return null
}

export function getSearchValue(previousSearch: string, key: string) {
  const nextSearch = `${previousSearch}${key}`
  const isRepeatedCharacter = [...nextSearch].every(character => character === key)

  // Repeated printable keys should cycle same-letter matches instead of searching "aaa".
  return isRepeatedCharacter ? key : nextSearch
}

export function toggleSelectedValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter(item => item !== value)
    : [...values, value]
}

export function getEnabledValues(items: OptionRecord[]) {
  return getEnabledItems(items).map(item => item.value)
}

export function hasSelectedAllEnabledValues(items: OptionRecord[], selectedValues: ReadonlySet<string>) {
  let hasEnabledValue = false

  for (const item of items) {
    if (item.disabled)
      continue

    hasEnabledValue = true

    if (!selectedValues.has(item.value))
      return false
  }

  return hasEnabledValue
}

export function selectAllEnabledValues(items: OptionRecord[]) {
  return getEnabledValues(items)
}

export function clearSelectedValues() {
  return [] as string[]
}

export function getRangeValues(
  items: OptionRecord[],
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

export function getKeyboardAction(
  event: KeyboardEventLike,
  options: KeyboardActionOptions,
): KeyboardAction {
  // Translate DOM key details into a small domain action so the React handler stays declarative.
  const orientationKeys = getOrientationKeyAliases(options.orientation)
  const extendSelection = options.multiple && event.shiftKey

  if (orientationKeys.next.has(event.key)) {
    return {
      type: 'move',
      direction: 'next',
      extendSelection,
    }
  }

  if (orientationKeys.previous.has(event.key)) {
    return {
      type: 'move',
      direction: 'previous',
      extendSelection,
    }
  }

  if (event.key === 'Home') {
    return {
      type: 'boundary',
      edge: 'first',
      extendSelection,
    }
  }

  if (event.key === 'End') {
    return {
      type: 'boundary',
      edge: 'last',
      extendSelection,
    }
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
    return options.multiple ? { type: 'toggleAll' } : { type: 'none' }
  }

  if (event.key === ' ') {
    return {
      type: 'toggle',
      extendSelection,
    }
  }

  if (event.key === 'Enter') {
    return options.multiple ? { type: 'none' } : { type: 'commit' }
  }

  if (!event.altKey && !event.ctrlKey && !event.metaKey && isPrintableKey(event.key)) {
    return {
      type: 'typeahead',
      key: event.key,
    }
  }

  return { type: 'none' }
}
