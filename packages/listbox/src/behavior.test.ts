import { describe, expect, it } from 'vitest'
import {
  getActiveValueFallback,
  getKeyboardAction,
  getNextEnabledValue,
  getOrientationKeyAliases,
  getRangeValues,
  getSearchValue,
  getTypeaheadValue,
  hasEnabledItems,
  hasSelectedAllEnabledValues,
  selectAllEnabledValues,
  toggleSelectedValue,
} from './behavior'

const items = [
  { value: 'alpha', textValue: 'Alpha', disabled: false, id: 'alpha-id' },
  { value: 'disabled', textValue: 'Disabled', disabled: true, id: 'disabled-id' },
  { value: 'beta', textValue: 'Beta', disabled: false, id: 'beta-id' },
  { value: 'bravo', textValue: 'Bravo', disabled: false, id: 'bravo-id' },
  { value: 'charlie', textValue: 'Charlie', disabled: false, id: 'charlie-id' },
]

function keyboardEvent(key: string, modifiers = {}) {
  return {
    key,
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    ...modifiers,
  }
}

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
    expect(getTypeaheadValue(items, null, 'a')).toBe('alpha')
    expect(getTypeaheadValue(items, 'alpha', 'b')).toBe('beta')
    expect(getTypeaheadValue(items, 'beta', 'b')).toBe('bravo')
    expect(getTypeaheadValue(items, 'charlie', 'd')).toBe(null)
  })

  it('collapses repeated typeahead keys while preserving multi-character searches', () => {
    expect(getSearchValue('', 'b')).toBe('b')
    expect(getSearchValue('b', 'b')).toBe('b')
    expect(getSearchValue('b', 'l')).toBe('bl')
  })

  it('toggles individual values and selects only enabled values in bulk', () => {
    expect(toggleSelectedValue(['alpha'], 'beta')).toEqual(['alpha', 'beta'])
    expect(toggleSelectedValue(['alpha', 'beta'], 'alpha')).toEqual(['beta'])
    expect(hasEnabledItems(items)).toBe(true)
    expect(hasEnabledItems([{ value: 'disabled', textValue: 'Disabled', disabled: true, id: 'disabled-id' }])).toBe(false)
    expect(selectAllEnabledValues(items)).toEqual(['alpha', 'beta', 'bravo', 'charlie'])
    expect(hasSelectedAllEnabledValues(items, new Set(['alpha', 'beta', 'bravo', 'charlie']))).toBe(true)
    expect(hasSelectedAllEnabledValues(items, new Set(['alpha', 'beta']))).toBe(false)
  })

  it('builds inclusive ranges using enabled item order', () => {
    expect(getRangeValues(items, 'alpha', 'bravo')).toEqual(['alpha', 'beta', 'bravo'])
    expect(getRangeValues(items, 'bravo', 'alpha')).toEqual(['alpha', 'beta', 'bravo'])
    expect(getRangeValues(items, 'disabled', 'charlie')).toEqual([])
  })

  it('maps keyboard events to small domain actions', () => {
    expect(getKeyboardAction(keyboardEvent('ArrowDown'), { multiple: false, orientation: 'vertical' })).toEqual({
      type: 'move',
      direction: 'next',
      extendSelection: false,
    })
    expect(getKeyboardAction(keyboardEvent('ArrowUp', { shiftKey: true }), { multiple: true, orientation: 'vertical' })).toEqual({
      type: 'move',
      direction: 'previous',
      extendSelection: true,
    })
    expect(getKeyboardAction(keyboardEvent('ArrowRight'), { multiple: false, orientation: 'horizontal' })).toEqual({
      type: 'move',
      direction: 'next',
      extendSelection: false,
    })
    expect(getKeyboardAction(keyboardEvent('a', { ctrlKey: true }), { multiple: true, orientation: 'vertical' })).toEqual({
      type: 'toggleAll',
    })
    expect(getKeyboardAction(keyboardEvent('x'), { multiple: false, orientation: 'vertical' })).toEqual({
      type: 'typeahead',
      key: 'x',
    })
    expect(getKeyboardAction(keyboardEvent('x', { altKey: true }), { multiple: false, orientation: 'vertical' })).toEqual({
      type: 'none',
    })
  })
})
