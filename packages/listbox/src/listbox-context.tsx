/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react'
import type { Orientation } from './types'
import { createContext } from '@radix-ui/react-context'
import { useId, useMemo, useState } from 'react'

interface ListboxContextValue {
  /**
   * Current selected value or values.
   */
  value: string | string[]
  /**
   * Updates the selected value in controlled or uncontrolled mode.
   */
  onValueChange: (value: string | string[]) => void
  /**
   * Whether the listbox accepts more than one selected option.
   */
  multiple: boolean
  /**
   * Value of the option currently referenced by `aria-activedescendant`.
   */
  activeValue: string | null
  /**
   * Updates the active option value.
   */
  setActiveValue: (value: string | null) => void
  /**
   * Generated id for the listbox element.
   */
  listboxId: string
  /**
   * Id of the rendered `ListboxLabel`, when present.
   */
  labelId: string | null
  /**
   * Registers or clears the rendered `ListboxLabel` id.
   */
  setLabelId: (id: string | null) => void
  /**
   * Whether all listbox interaction is disabled.
   */
  disabled: boolean
  /**
   * Whether navigation is allowed while selection changes are blocked.
   */
  readOnly: boolean
  /**
   * Whether keyboard navigation wraps at the first and last enabled option.
   */
  loop: boolean
  /**
   * Direction used to interpret arrow-key navigation.
   */
  orientation: Orientation
  /**
   * Whether the listbox is marked as required for form-like usage.
   */
  required: boolean
  /**
   * Buffered printable-key search string for typeahead.
   */
  typeaheadValue: string
  /**
   * Updates the buffered typeahead search string.
   */
  setTypeaheadValue: (value: string) => void
  /**
   * Anchor value used when extending multi-select ranges.
   */
  lastSelectedValue: string | null
  /**
   * Updates the multi-select range anchor value.
   */
  setLastSelectedValue: (value: string | null) => void
}

interface ListboxGroupContextValue {
  /**
   * Id of the rendered group label, when present.
   */
  groupLabelId: string | null
  /**
   * Registers or clears the rendered group label id.
   */
  setGroupLabelId: (id: string | null) => void
}

const [ListboxProviderImpl, useListboxContext] = createContext<ListboxContextValue>('Listbox')
const [ListboxGroupProviderImpl, useListboxGroupContext] = createContext<ListboxGroupContextValue>('ListboxGroup')

function ListboxProvider({
  value,
  onValueChange,
  multiple,
  activeValue,
  setActiveValue,
  labelId,
  setLabelId,
  disabled,
  readOnly,
  loop,
  orientation,
  required,
  children,
}: Omit<ListboxContextValue, 'listboxId' | 'typeaheadValue' | 'setTypeaheadValue' | 'lastSelectedValue' | 'setLastSelectedValue'> & {
  children: ReactNode
}) {
  const listboxId = useId()
  const [typeaheadValue, setTypeaheadValue] = useState('')
  const [lastSelectedValue, setLastSelectedValue] = useState<string | null>(null)

  const contextValue = useMemo(() => ({
    value,
    onValueChange,
    multiple,
    activeValue,
    setActiveValue,
    listboxId,
    labelId,
    setLabelId,
    disabled,
    readOnly,
    loop,
    orientation,
    required,
    typeaheadValue,
    setTypeaheadValue,
    lastSelectedValue,
    setLastSelectedValue,
  }), [
    value,
    onValueChange,
    multiple,
    activeValue,
    setActiveValue,
    listboxId,
    labelId,
    setLabelId,
    disabled,
    readOnly,
    loop,
    orientation,
    required,
    typeaheadValue,
    lastSelectedValue,
  ])

  return <ListboxProviderImpl {...contextValue}>{children}</ListboxProviderImpl>
}

function ListboxGroupProvider({
  groupLabelId,
  setGroupLabelId,
  children,
}: Omit<ListboxGroupContextValue, 'children'> & { children: ReactNode }) {
  const contextValue = useMemo(() => ({
    groupLabelId,
    setGroupLabelId,
  }), [groupLabelId, setGroupLabelId])

  return <ListboxGroupProviderImpl {...contextValue}>{children}</ListboxGroupProviderImpl>
}

export {
  ListboxGroupProvider,
  ListboxProvider,
  useListboxContext,
  useListboxGroupContext,
}
