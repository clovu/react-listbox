/* eslint-disable react-refresh/only-export-components */
import type { ReactNode, RefObject } from 'react'
import type { Orientation } from './types'
import { createContext } from '@radix-ui/react-context'
import { useId, useMemo, useRef } from 'react'

interface RootContextValue {
  /**
   * Current selected value or values.
   */
  value: string | string[]
  /**
   * Current selected values normalized into a lookup set.
   */
  selectedValues: ReadonlySet<string>
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
   * Id of the rendered root label, when present.
   */
  labelId: string | null
  /**
   * Registers or clears the rendered root label id.
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
   * Whether single-select focus movement also updates selection.
   */
  selectionFollowsFocus: boolean
  /**
   * Direction used to interpret arrow-key navigation.
   */
  orientation: Orientation
  /**
   * Whether the listbox is marked as required for form-like usage.
   */
  required: boolean
  /**
   * Anchor value used when extending multi-select ranges.
   */
  selectionAnchorRef: RefObject<string | null>
}

interface GroupContextValue {
  /**
   * Id of the rendered group label, when present.
   */
  groupLabelId: string | null
  /**
   * Registers or clears the rendered group label id.
   */
  setGroupLabelId: (id: string | null) => void
}

const [RootProviderImpl, useRootContext] = createContext<RootContextValue>('Root')
const [GroupProviderImpl, useGroupContext] = createContext<GroupContextValue>('Group')

function RootProvider({
  value,
  selectedValues,
  onValueChange,
  multiple,
  activeValue,
  setActiveValue,
  labelId,
  setLabelId,
  disabled,
  readOnly,
  loop,
  selectionFollowsFocus,
  orientation,
  required,
  children,
}: Omit<RootContextValue, 'listboxId' | 'selectionAnchorRef'> & {
  children: ReactNode
}) {
  const listboxId = useId()
  // Range anchors are transient interaction state and should not re-render the provider.
  const selectionAnchorRef = useRef<string | null>(null)

  const contextValue = useMemo(() => ({
    value,
    selectedValues,
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
    selectionFollowsFocus,
    orientation,
    required,
    selectionAnchorRef,
  }), [
    value,
    selectedValues,
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
    selectionFollowsFocus,
    orientation,
    required,
    selectionAnchorRef,
  ])

  return <RootProviderImpl {...contextValue}>{children}</RootProviderImpl>
}

function GroupProvider({
  groupLabelId,
  setGroupLabelId,
  children,
}: Omit<GroupContextValue, 'children'> & { children: ReactNode }) {
  const contextValue = useMemo(() => ({
    groupLabelId,
    setGroupLabelId,
  }), [groupLabelId, setGroupLabelId])

  return <GroupProviderImpl {...contextValue}>{children}</GroupProviderImpl>
}

export {
  GroupProvider,
  RootProvider,
  useGroupContext,
  useRootContext,
}
