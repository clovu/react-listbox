import { describe, expect, it } from 'vitest'
import {
  Listbox,
  ListboxContent,
  ListboxGroup,
  ListboxGroupLabel,
  ListboxItem,
  ListboxLabel,
  ListboxList,
  ListboxOption,
  ListboxRoot,
} from '../packages/listbox/src/index'

describe('public exports', () => {
  it('exposes the primitive component entry points', () => {
    expect(Listbox).toBe(ListboxRoot)
    expect(ListboxList).toBe(ListboxContent)
    expect(ListboxOption).toBe(ListboxItem)
    expect(ListboxGroup).toBeTypeOf('function')
    expect(ListboxGroupLabel).toBeTypeOf('function')
    expect(ListboxLabel).toBeTypeOf('function')
  })
})
