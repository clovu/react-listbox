import type { KeyboardEvent, MouseEvent, Ref, SyntheticEvent } from 'react'
import type { NavigationBoundary, NavigationDirection } from './behavior'
import type { CollectionItem } from './collection'
import type {
  ContentProps,
  GroupLabelProps,
  GroupProps,
  ItemProps,
  LabelProps,
  RootProps,
} from './types'
import { Primitive } from '@radix-ui/react-primitive'
import { Slot } from '@radix-ui/react-slot'
import { useControllableState } from '@radix-ui/react-use-controllable-state'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  clearSelectedValues,
  getActiveValueFallback,
  getItemByValue,
  getKeyboardAction,
  getNextEnabledValue,
  getRangeValues,
  getSearchValue,
  getSelectedSet,
  getSelectedValue,
  getSelectedValues,
  getTypeaheadResetDelay,
  getTypeaheadValue,
  hasEnabledItems,
  hasSelectedAllEnabledValues,
  moveValueWithBoundary,
  selectAllEnabledValues,
  toggleSelectedValue,
} from './behavior'
import { Collection, useCollection } from './collection'
import {
  GroupProvider,
  RootProvider,
  useGroupContext,
  useRootContext,
} from './context'

type DivEventHandler<E extends SyntheticEvent<HTMLDivElement>> = (event: E) => void

function composeEventHandlers<E extends SyntheticEvent<HTMLDivElement>>(
  userHandler: DivEventHandler<E> | undefined,
  internalHandler: DivEventHandler<E>,
) {
  return (event: E) => {
    userHandler?.(event)

    if (!event.defaultPrevented)
      internalHandler(event)
  }
}

function getElementId(id: string | undefined, fallbackId: string) {
  return id ?? fallbackId
}

function focusOwningListbox(event: MouseEvent<HTMLDivElement>) {
  const listbox = event.currentTarget.closest<HTMLElement>('[role="listbox"]')
  listbox?.focus()
}

/**
 * Provides listbox state and selection behavior for descendant primitives.
 */
export function ListboxRoot({
  value: controlledValue,
  onValueChange,
  multiple = false,
  disabled = false,
  readOnly = false,
  loop = false,
  required = false,
  defaultValue,
  orientation = 'vertical',
  selectionFollowsFocus = true,
  children,
}: RootProps) {
  const [labelId, setLabelId] = useState<string | null>(null)
  const [activeValue, setActiveValue] = useState<string | null>(null)

  const [value, setValue] = useControllableState<string | string[]>({
    prop: controlledValue,
    defaultProp: defaultValue ?? (multiple ? [] : ''),
    onChange: onValueChange as ((value: string | string[]) => void) | undefined,
  })
  const selectedValues = useMemo(() => getSelectedSet(value, multiple), [multiple, value])

  return (
    <Collection.Provider>
      <RootProvider
        value={value}
        selectedValues={selectedValues}
        onValueChange={setValue}
        multiple={multiple}
        activeValue={activeValue}
        setActiveValue={setActiveValue}
        labelId={labelId}
        setLabelId={setLabelId}
        disabled={disabled}
        readOnly={readOnly}
        loop={loop}
        selectionFollowsFocus={selectionFollowsFocus}
        orientation={orientation}
        required={required}
      >
        {children}
      </RootProvider>
    </Collection.Provider>
  )
}

/**
 * Alias for `ListboxRoot`.
 */
export const Listbox = ListboxRoot

/**
 * Renders the accessible label associated with the listbox.
 */
export function ListboxLabel({
  ref,
  children,
  asChild = false,
  id: idProp,
  ...props
}: LabelProps & { ref?: Ref<HTMLDivElement> }) {
  const { setLabelId } = useRootContext('Label')
  const generatedId = useId()
  const id = getElementId(idProp, generatedId)

  useEffect(() => {
    setLabelId(id)
    return () => setLabelId(null)
  }, [id, setLabelId])

  if (asChild) {
    return (
      <Slot id={id} ref={ref} {...props}>
        {children}
      </Slot>
    )
  }

  return (
    <Primitive.div id={id} ref={ref} {...props}>
      {children}
    </Primitive.div>
  )
}

ListboxLabel.displayName = 'ListboxLabel'

function useContentBehavior() {
  const {
    value,
    selectedValues,
    onValueChange,
    multiple,
    activeValue,
    setActiveValue,
    disabled,
    readOnly,
    loop,
    selectionFollowsFocus,
    orientation,
    selectionAnchorRef,
    required,
  } = useRootContext('Content')
  const getItems = useCollection()
  // Typeahead is transient input state; refs avoid re-rendering on every printable key.
  const typeaheadValueRef = useRef('')
  const typeaheadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const getActiveItem = useCallback((items: CollectionItem[]) => {
    return getItemByValue(items, activeValue)
  }, [activeValue])

  const scrollToValue = useCallback((itemValue: string) => {
    const item = getItems().find(entry => entry.value === itemValue)
    item?.element.scrollIntoView?.({
      block: 'nearest',
      inline: 'nearest',
    })
  }, [getItems])

  const setSelectionAnchor = useCallback((nextValue: string) => {
    selectionAnchorRef.current = nextValue
  }, [selectionAnchorRef])

  const setActiveAndMaybeSelect = useCallback((nextValue: string | null) => {
    if (!nextValue)
      return

    setActiveValue(nextValue)
    scrollToValue(nextValue)

    // APG permits this selection-follows-focus model; the prop lets consumers opt into manual commits.
    if (!multiple && selectionFollowsFocus && !readOnly && value !== nextValue)
      onValueChange(nextValue)
  }, [multiple, onValueChange, readOnly, scrollToValue, selectionFollowsFocus, setActiveValue, value])

  const toggleValue = useCallback((optionValue: string) => {
    if (readOnly)
      return

    if (multiple) {
      const selectedValueList = getSelectedValues(value, true)
      onValueChange(toggleSelectedValue(selectedValueList, optionValue))
      setSelectionAnchor(optionValue)
      return
    }

    // Manual single-select mode may clear the current value unless the listbox is required.
    if (!required && !selectionFollowsFocus && value === optionValue)
      onValueChange('')
    else
      onValueChange(optionValue)

    setSelectionAnchor(optionValue)
  }, [multiple, onValueChange, readOnly, required, selectionFollowsFocus, setSelectionAnchor, value])

  const selectRange = useCallback((toValue: string) => {
    if (!multiple || readOnly)
      return

    const items = getItems()
    const selectedValueList = getSelectedValues(value, true)
    const anchorValue = selectionAnchorRef.current
      ?? getSelectedValue(value, true)
      ?? activeValue
      ?? toValue
    const rangeValues = getRangeValues(items, anchorValue, toValue)
    const nextValues = Array.from(new Set([...selectedValueList, ...rangeValues]))

    onValueChange(nextValues)
    setSelectionAnchor(anchorValue)
  }, [activeValue, getItems, multiple, onValueChange, readOnly, selectionAnchorRef, setSelectionAnchor, value])

  const toggleAllEnabledValues = useCallback(() => {
    if (!multiple || readOnly)
      return

    const items = getItems()
    const nextValues = hasSelectedAllEnabledValues(items, selectedValues)
      ? clearSelectedValues()
      : selectAllEnabledValues(items)

    onValueChange(nextValues)
  }, [getItems, multiple, onValueChange, readOnly, selectedValues])

  const moveToValue = useCallback((nextValue: string | null, options?: { extendSelection?: boolean }) => {
    if (!nextValue)
      return

    setActiveValue(nextValue)
    scrollToValue(nextValue)

    if (options?.extendSelection) {
      selectRange(nextValue)
      return
    }

    if (!multiple && selectionFollowsFocus && !readOnly && value !== nextValue)
      onValueChange(nextValue)
  }, [multiple, onValueChange, readOnly, scrollToValue, selectRange, selectionFollowsFocus, setActiveValue, value])

  const moveByDirection = useCallback((direction: NavigationDirection, extendSelection = false) => {
    const items = getItems()
    const currentValue = activeValue ?? getActiveValueFallback(items, value, multiple)
    const nextValue = getNextEnabledValue(items, currentValue, direction, loop)

    moveToValue(nextValue, { extendSelection })
  }, [activeValue, getItems, loop, moveToValue, multiple, value])

  const moveToBoundary = useCallback((edge: NavigationBoundary, extendSelection = false) => {
    const items = getItems()
    const nextValue = moveValueWithBoundary(items, edge)

    moveToValue(nextValue, { extendSelection })
  }, [getItems, moveToValue])

  const clearTypeaheadTimer = useCallback(() => {
    if (!typeaheadTimerRef.current)
      return

    clearTimeout(typeaheadTimerRef.current)
    typeaheadTimerRef.current = null
  }, [])

  const scheduleTypeaheadReset = useCallback(() => {
    clearTypeaheadTimer()
    typeaheadTimerRef.current = setTimeout(() => {
      typeaheadValueRef.current = ''
      typeaheadTimerRef.current = null
    }, getTypeaheadResetDelay())
  }, [clearTypeaheadTimer])

  const handleTypeahead = useCallback((key: string) => {
    const items = getItems()
    const searchValue = getSearchValue(typeaheadValueRef.current, key)
    const nextValue = getTypeaheadValue(items, activeValue, searchValue)

    typeaheadValueRef.current = searchValue
    scheduleTypeaheadReset()

    if (nextValue)
      setActiveAndMaybeSelect(nextValue)
  }, [activeValue, getItems, scheduleTypeaheadReset, setActiveAndMaybeSelect])

  const handleFocus = useCallback(() => {
    if (disabled || activeValue)
      return

    const nextValue = getActiveValueFallback(getItems(), value, multiple)

    setActiveAndMaybeSelect(nextValue)
  }, [activeValue, disabled, getItems, multiple, setActiveAndMaybeSelect, value])

  const toggleActiveItem = useCallback((items: CollectionItem[], extendSelection: boolean) => {
    const activeItem = getActiveItem(items)

    if (!activeItem)
      return false

    if (extendSelection)
      selectRange(activeItem.value)
    else
      toggleValue(activeItem.value)

    return true
  }, [getActiveItem, selectRange, toggleValue])

  const commitActiveItem = useCallback((items: CollectionItem[]) => {
    if (readOnly)
      return false

    const activeItem = getActiveItem(items)

    if (!activeItem)
      return false

    toggleValue(activeItem.value)
    return true
  }, [getActiveItem, readOnly, toggleValue])

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled)
      return

    const items = getItems()
    if (!hasEnabledItems(items))
      return

    const action = getKeyboardAction(event, {
      multiple,
      orientation,
    })

    switch (action.type) {
      case 'move':
        event.preventDefault()
        moveByDirection(action.direction, action.extendSelection)
        break
      case 'boundary':
        event.preventDefault()
        moveToBoundary(action.edge, action.extendSelection)
        break
      case 'toggleAll':
        event.preventDefault()
        toggleAllEnabledValues()
        break
      case 'toggle':
        if (toggleActiveItem(items, action.extendSelection))
          event.preventDefault()
        break
      case 'commit':
        if (commitActiveItem(items))
          event.preventDefault()
        break
      case 'typeahead':
        event.preventDefault()
        handleTypeahead(action.key)
        break
      case 'none':
        break
    }
  }, [
    commitActiveItem,
    disabled,
    getItems,
    handleTypeahead,
    moveByDirection,
    moveToBoundary,
    multiple,
    orientation,
    toggleActiveItem,
    toggleAllEnabledValues,
  ])

  useEffect(() => {
    return clearTypeaheadTimer
  }, [clearTypeaheadTimer])

  return {
    getItems,
    handleFocus,
    handleKeyDown,
  }
}

/**
 * Renders the focusable listbox element and handles keyboard navigation.
 */
export function ListboxContent({
  ref,
  children,
  id: idProp,
  'aria-labelledby': ariaLabelledBy,
  onFocus,
  onKeyDown,
  ...props
}: ContentProps & { ref?: Ref<HTMLDivElement> }) {
  const {
    selectedValues,
    multiple,
    activeValue,
    listboxId,
    labelId,
    disabled,
    readOnly,
    orientation,
    required,
  } = useRootContext('Content')
  const { getItems, handleFocus, handleKeyDown } = useContentBehavior()
  const activeDescendantId = useMemo(() => {
    return activeValue ? getItemByValue(getItems(), activeValue)?.id : undefined
  }, [activeValue, getItems])
  const selectedDataValue = useMemo(() => {
    return selectedValues.size > 0 ? [...selectedValues].join(' ') : undefined
  }, [selectedValues])
  const id = getElementId(idProp, listboxId)
  const labelledBy = labelId ?? ariaLabelledBy

  return (
    <Primitive.div
      ref={ref}
      {...props}
      role="listbox"
      id={id}
      aria-labelledby={labelledBy || undefined}
      aria-multiselectable={multiple || undefined}
      aria-activedescendant={activeDescendantId}
      aria-orientation={orientation}
      aria-disabled={disabled || undefined}
      aria-readonly={readOnly || undefined}
      aria-required={required || undefined}
      tabIndex={disabled ? -1 : 0}
      onFocus={composeEventHandlers(onFocus, handleFocus)}
      onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
      data-disabled={disabled ? '' : undefined}
      data-orientation={orientation}
      data-value={selectedDataValue}
    >
      <Collection.Slot>{children}</Collection.Slot>
    </Primitive.div>
  )
}

ListboxContent.displayName = 'ListboxContent'

/**
 * Alias for `ListboxContent`.
 */
export const ListboxList = ListboxContent

function useItemBehavior(optionValue: string, disabled: boolean) {
  const {
    value,
    selectedValues,
    onValueChange,
    multiple,
    activeValue,
    setActiveValue,
    disabled: rootDisabled,
    readOnly,
    selectionAnchorRef,
  } = useRootContext('Item')
  const isItemDisabled = disabled || rootDisabled
  const isSelected = selectedValues.has(optionValue)
  const isHighlighted = activeValue === optionValue

  const setSelectionAnchor = useCallback(() => {
    selectionAnchorRef.current = optionValue
  }, [optionValue, selectionAnchorRef])

  const selectItem = useCallback(() => {
    if (isItemDisabled || readOnly)
      return

    setActiveValue(optionValue)

    if (multiple) {
      onValueChange(toggleSelectedValue(getSelectedValues(value, true), optionValue))
      setSelectionAnchor()
      return
    }

    onValueChange(optionValue)
    setSelectionAnchor()
  }, [isItemDisabled, multiple, onValueChange, optionValue, readOnly, setActiveValue, setSelectionAnchor, value])

  const handleMouseMove = useCallback(() => {
    if (!isItemDisabled)
      setActiveValue(optionValue)
  }, [isItemDisabled, optionValue, setActiveValue])

  const handleMouseLeave = useCallback(() => {
    if (!isItemDisabled && activeValue === optionValue)
      setActiveValue(null)
  }, [isItemDisabled, setActiveValue, optionValue, activeValue])

  return {
    isHighlighted,
    isItemDisabled,
    isSelected,
    handleMouseMove,
    selectItem,
    handleMouseLeave,
  }
}

/**
 * Renders a selectable option inside the listbox.
 */
export function ListboxItem({
  ref,
  value: optionValue,
  disabled = false,
  textValue,
  children,
  asChild = false,
  onClick,
  onMouseMove,
  onMouseLeave,
  id: idProp,
  ...props
}: ItemProps & { ref?: Ref<HTMLDivElement> }) {
  const generatedId = useId()
  const id = getElementId(idProp, generatedId)
  const {
    isHighlighted,
    isItemDisabled,
    isSelected,
    handleMouseMove,
    selectItem,
    handleMouseLeave,
  } = useItemBehavior(optionValue, disabled)

  const itemData = useMemo(() => ({
    value: optionValue,
    disabled: isItemDisabled,
    textValue: textValue ?? '',
    id,
  }), [id, isItemDisabled, optionValue, textValue])

  const handleClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
    focusOwningListbox(event)
    selectItem()
  }, [selectItem])

  const itemProps = {
    ...props,
    'role': 'option',
    id,
    'aria-selected': isSelected,
    'aria-disabled': isItemDisabled || undefined,
    'onMouseMove': composeEventHandlers(onMouseMove, handleMouseMove),
    'onClick': composeEventHandlers(onClick, handleClick),
    'onMouseLeave': composeEventHandlers(onMouseLeave, handleMouseLeave),
    'data-state': isSelected ? 'checked' : 'unchecked',
    'data-highlighted': isHighlighted ? '' : undefined,
    'data-disabled': isItemDisabled ? '' : undefined,
  }

  return (
    <Collection.ItemSlot asChild={asChild} itemData={itemData} ref={ref} {...itemProps}>
      {children}
    </Collection.ItemSlot>
  )
}

ListboxItem.displayName = 'ListboxItem'

/**
 * Alias for `ListboxItem`.
 */
export const ListboxOption = ListboxItem

/**
 * Renders an accessible group for related listbox options.
 */
export function ListboxGroup({
  ref,
  children,
  asChild = false,
  ...props
}: GroupProps & { ref?: Ref<HTMLDivElement> }) {
  const [groupLabelId, setGroupLabelId] = useState<string | null>(null)
  const groupProps = {
    ...props,
    'role': 'group',
    'aria-labelledby': groupLabelId || undefined,
  }

  return (
    <GroupProvider groupLabelId={groupLabelId} setGroupLabelId={setGroupLabelId}>
      {asChild
        ? (
            <Slot ref={ref} {...groupProps}>
              {children}
            </Slot>
          )
        : (
            <Primitive.div ref={ref} {...groupProps}>
              {children}
            </Primitive.div>
          )}
    </GroupProvider>
  )
}

ListboxGroup.displayName = 'ListboxGroup'

/**
 * Renders the label associated with a `ListboxGroup`.
 */
export function ListboxGroupLabel({
  ref,
  children,
  asChild = false,
  id: idProp,
  ...props
}: GroupLabelProps & { ref?: Ref<HTMLDivElement> }) {
  const { setGroupLabelId } = useGroupContext('GroupLabel')
  const generatedId = useId()
  const id = getElementId(idProp, generatedId)

  useEffect(() => {
    setGroupLabelId(id)
    return () => setGroupLabelId(null)
  }, [id, setGroupLabelId])

  if (asChild) {
    return (
      <Slot id={id} ref={ref} {...props}>
        {children}
      </Slot>
    )
  }

  return (
    <Primitive.div id={id} ref={ref} {...props}>
      {children}
    </Primitive.div>
  )
}

ListboxGroupLabel.displayName = 'ListboxGroupLabel'
