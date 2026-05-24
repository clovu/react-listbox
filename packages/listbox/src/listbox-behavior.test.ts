import { describe, expect, it } from 'vitest'
import {
  getActiveValueFallback,
  getNextEnabledValue,
  getOrientationKeyAliases,
  getRangeValues,
  getTypeaheadValue,
  hasSelectedAllEnabledValues,
  selectAllEnabledValues,
  toggleSelectedValue,
} from './listbox-behavior'

const items = [
  { value: 'alpha', textValue: 'Alpha', disabled: false, id: 'alpha-id' },
  { value: 'disabled', textValue: 'Disabled', disabled: true, id: 'disabled-id' },
  { value: 'beta', textValue: 'Beta', disabled: false, id: 'beta-id' },
  { value: 'bravo', textValue: 'Bravo', disabled: false, id: 'bravo-id' },
  { value: 'charlie', textValue: 'Charlie', disabled: false, id: 'charlie-id' },
]

describe('listbox behavior helpers', () => {
  it('finds the selected value before falling back to the first enabled item', () => {
    expect(getActiveValueFallback(items, 'beta', false)).toBe('beta')
    expect(getActiveValueFallback(items, '', false)).toBe('alpha')
    expect(getActiveValueFallback(items, ['bravo'], true)).toBe('bravo')
  })

  it('moves through enabled items and preserves boundaries unless looping is enabled', () => {
    expect(getNextEnabledValue(items, 'alpha', 'next', false)).toBe('beta')
    expect(getNextEnabledValue(items, 'charlie', 'next', false)).toBe('charlie')
    expect(getNextEnabledValue(items, 'charlie', 'next', true)).toBe('alpha')
    expect(getNextEnabledValue(items, 'alpha', 'previous', true)).toBe('charlie')
  })

  it('maps horizontal listboxes to horizontal and vertical arrow aliases', () => {
    const horizontalKeys = getOrientationKeyAliases('horizontal')
    const verticalKeys = getOrientationKeyAliases('vertical')

    expect(horizontalKeys.next.has('ArrowRight')).toBe(true)
    expect(horizontalKeys.next.has('ArrowDown')).toBe(true)
    expect(horizontalKeys.previous.has('ArrowLeft')).toBe(true)
    expect(horizontalKeys.previous.has('ArrowUp')).toBe(true)
    expect(verticalKeys.next.has('ArrowRight')).toBe(false)
  })

  it('cycles typeahead matches after the active item and skips disabled items', () => {
    expect(getTypeaheadValue(items, 'alpha', 'b')).toBe('beta')
    expect(getTypeaheadValue(items, 'beta', 'b')).toBe('bravo')
    expect(getTypeaheadValue(items, 'charlie', 'd')).toBe(null)
  })

  it('toggles individual values and selects only enabled values in bulk', () => {
    expect(toggleSelectedValue(['alpha'], 'beta')).toEqual(['alpha', 'beta'])
    expect(toggleSelectedValue(['alpha', 'beta'], 'alpha')).toEqual(['beta'])
    expect(selectAllEnabledValues(items)).toEqual(['alpha', 'beta', 'bravo', 'charlie'])
    expect(hasSelectedAllEnabledValues(items, ['alpha', 'beta', 'bravo', 'charlie'])).toBe(true)
    expect(hasSelectedAllEnabledValues(items, ['alpha', 'beta'])).toBe(false)
  })

  it('builds inclusive ranges using enabled item order', () => {
    expect(getRangeValues(items, 'alpha', 'bravo')).toEqual(['alpha', 'beta', 'bravo'])
    expect(getRangeValues(items, 'bravo', 'alpha')).toEqual(['alpha', 'beta', 'bravo'])
    expect(getRangeValues(items, 'disabled', 'charlie')).toEqual([])
  })
})
