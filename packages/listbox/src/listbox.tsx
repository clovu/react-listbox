import type { KeyboardEvent, MouseEvent, Ref, SyntheticEvent } from 'react'
import type { CollectionItem } from './listbox-collection'
import type {
  ListboxContentProps,
  ListboxGroupLabelProps,
  ListboxGroupProps,
  ListboxItemProps,
  ListboxLabelProps,
  ListboxRootProps,
} from './types'
import { Primitive } from '@radix-ui/react-primitive'
import { Slot } from '@radix-ui/react-slot'
import { useControllableState } from '@radix-ui/react-use-controllable-state'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  clearSelectedValues,
  getActiveValueFallback,
  getEnabledItems,
  getNextEnabledValue,
  getOrientationKeyAliases,
  getRangeValues,
  getSelectedSet,
  getSelectedValue,
  getSelectedValues,
  getTypeaheadResetDelay,
  getTypeaheadValue,
  hasSelectedAllEnabledValues,
  isPrintableKey,
  moveValueWithBoundary,
  selectAllEnabledValues,
  toggleSelectedValue,
} from './listbox-behavior'
import { Collection, useCollection } from './listbox-collection'
import {
  ListboxGroupProvider,
  ListboxProvider,
  useListboxContext,
  useListboxGroupContext,
} from './listbox-context'

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

function getSearchValue(previousSearch: string, key: string) {
  const nextSearch = `${previousSearch}${key}`
  const isRepeatedCharacter = [...nextSearch].every(character => character === key)

  return isRepeatedCharacter ? key : nextSearch
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
  children,
}: ListboxRootProps) {
  const [labelId, setLabelId] = useState<string | null>(null)
  const [activeValue, setActiveValue] = useState<string | null>(null)

  const [value, setValue] = useControllableState<string | string[]>({
    prop: controlledValue,
    defaultProp: defaultValue ?? (multiple ? [] : ''),
    onChange: onValueChange as ((value: string | string[]) => void) | undefined,
  })

  return (
    <Collection.Provider>
      <ListboxProvider
        value={value}
        onValueChange={setValue}
        multiple={multiple}
        activeValue={activeValue}
        setActiveValue={setActiveValue}
        labelId={labelId}
        setLabelId={setLabelId}
        disabled={disabled}
        readOnly={readOnly}
        loop={loop}
        orientation={orientation}
        required={required}
      >
        {children}
      </ListboxProvider>
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
}: ListboxLabelProps & { ref?: Ref<HTMLDivElement> }) {
  const { setLabelId } = useListboxContext('ListboxLabel')
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

function useListboxContentBehavior() {
  const context = useListboxContext('ListboxContent')
  const getItems = useCollection()
  const typeaheadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const getActiveItem = useCallback((items: CollectionItem[]) => {
    return context.activeValue
      ? items.find(item => item.value === context.activeValue) ?? null
      : null
  }, [context.activeValue])

  const scrollToValue = useCallback((itemValue: string) => {
    const item = getItems().find(entry => entry.value === itemValue)
    item?.element.scrollIntoView?.({
      block: 'nearest',
      inline: 'nearest',
    })
  }, [getItems])

  const setActiveAndMaybeSelect = useCallback((nextValue: string | null) => {
    if (!nextValue)
      return

    context.setActiveValue(nextValue)
    scrollToValue(nextValue)

    if (!context.multiple && !context.readOnly && context.value !== nextValue)
      context.onValueChange(nextValue)
  }, [context, scrollToValue])

  const toggleValue = useCallback((optionValue: string) => {
    if (context.readOnly)
      return

    if (context.multiple) {
      const selectedValues = getSelectedValues(context.value, true)
      context.onValueChange(toggleSelectedValue(selectedValues, optionValue))
      context.setLastSelectedValue(optionValue)
      return
    }

    context.onValueChange(optionValue)
    context.setLastSelectedValue(optionValue)
  }, [context])

  const selectRange = useCallback((toValue: string) => {
    if (!context.multiple || context.readOnly)
      return

    const items = getItems()
    const selectedValues = getSelectedValues(context.value, true)
    const anchorValue = context.lastSelectedValue
      ?? getSelectedValue(context.value, true)
      ?? context.activeValue
      ?? toValue
    const rangeValues = getRangeValues(items, anchorValue, toValue)
    const nextValues = Array.from(new Set([...selectedValues, ...rangeValues]))

    context.onValueChange(nextValues)
    context.setLastSelectedValue(anchorValue)
  }, [context, getItems])

  const toggleAllEnabledValues = useCallback(() => {
    if (!context.multiple || context.readOnly)
      return

    const items = getItems()
    const selectedValues = getSelectedValues(context.value, true)
    const nextValues = hasSelectedAllEnabledValues(items, selectedValues)
      ? clearSelectedValues()
      : selectAllEnabledValues(items)

    context.onValueChange(nextValues)
  }, [context, getItems])

  const moveToValue = useCallback((nextValue: string | null, options?: { extendSelection?: boolean }) => {
    if (!nextValue)
      return

    context.setActiveValue(nextValue)
    scrollToValue(nextValue)

    if (options?.extendSelection) {
      selectRange(nextValue)
      return
    }

    if (!context.multiple && !context.readOnly && context.value !== nextValue)
      context.onValueChange(nextValue)
  }, [context, scrollToValue, selectRange])

  const moveByDirection = useCallback((direction: 'next' | 'previous', extendSelection = false) => {
    const items = getItems()
    const currentValue = context.activeValue ?? getActiveValueFallback(items, context.value, context.multiple)
    const nextValue = getNextEnabledValue(items, currentValue, direction, context.loop)

    moveToValue(nextValue, { extendSelection })
  }, [context, getItems, moveToValue])

  const moveToBoundary = useCallback((edge: 'first' | 'last', extendSelection = false) => {
    const items = getItems()
    const nextValue = moveValueWithBoundary(items, edge)

    moveToValue(nextValue, { extendSelection })
  }, [getItems, moveToValue])

  const handleTypeahead = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (!isPrintableKey(event.key) || event.altKey || event.ctrlKey || event.metaKey)
      return false

    event.preventDefault()

    const items = getItems()
    const searchValue = getSearchValue(context.typeaheadValue, event.key)
    const nextValue = getTypeaheadValue(items, context.activeValue, searchValue)

    context.setTypeaheadValue(searchValue)

    if (typeaheadTimerRef.current)
      clearTimeout(typeaheadTimerRef.current)

    typeaheadTimerRef.current = setTimeout(() => {
      context.setTypeaheadValue('')
    }, getTypeaheadResetDelay())

    if (nextValue)
      setActiveAndMaybeSelect(nextValue)

    return true
  }, [context, getItems, setActiveAndMaybeSelect])

  const handleFocus = useCallback(() => {
    if (context.disabled || context.activeValue)
      return

    const nextValue = getActiveValueFallback(getItems(), context.value, context.multiple)

    setActiveAndMaybeSelect(nextValue)
  }, [context, getItems, setActiveAndMaybeSelect])

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (context.disabled)
      return

    const items = getItems()
    if (getEnabledItems(items).length === 0)
      return

    const orientationKeys = getOrientationKeyAliases(context.orientation)

    if (orientationKeys.next.has(event.key)) {
      event.preventDefault()
      moveByDirection('next', context.multiple && event.shiftKey)
      return
    }

    if (orientationKeys.previous.has(event.key)) {
      event.preventDefault()
      moveByDirection('previous', context.multiple && event.shiftKey)
      return
    }

    if (event.key === 'Home') {
      event.preventDefault()
      moveToBoundary('first', context.multiple && event.shiftKey)
      return
    }

    if (event.key === 'End') {
      event.preventDefault()
      moveToBoundary('last', context.multiple && event.shiftKey)
      return
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
      if (context.multiple) {
        event.preventDefault()
        toggleAllEnabledValues()
      }
      return
    }

    if (event.key === ' ') {
      const activeItem = getActiveItem(items)

      if (activeItem) {
        event.preventDefault()
        if (context.multiple && event.shiftKey)
          selectRange(activeItem.value)
        else
          toggleValue(activeItem.value)
      }
      return
    }

    if (event.key === 'Enter' && !context.multiple) {
      const activeItem = getActiveItem(items)

      if (activeItem && !context.readOnly) {
        event.preventDefault()
        toggleValue(activeItem.value)
      }
      return
    }

    handleTypeahead(event)
  }, [
    context,
    getActiveItem,
    getItems,
    handleTypeahead,
    moveByDirection,
    moveToBoundary,
    selectRange,
    toggleAllEnabledValues,
    toggleValue,
  ])

  useEffect(() => {
    return () => {
      if (typeaheadTimerRef.current)
        clearTimeout(typeaheadTimerRef.current)
    }
  }, [])

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
}: ListboxContentProps & { ref?: Ref<HTMLDivElement> }) {
  const {
    value,
    multiple,
    activeValue,
    listboxId,
    labelId,
    disabled,
    readOnly,
    orientation,
    required,
  } = useListboxContext('ListboxContent')
  const { getItems, handleFocus, handleKeyDown } = useListboxContentBehavior()
  const selectedValues = getSelectedSet(value, multiple)
  const activeDescendantId = activeValue
    ? getItems().find(item => item.value === activeValue)?.id
    : undefined
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
      data-value={selectedValues.size > 0 ? [...selectedValues].join(' ') : undefined}
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

function useListboxItemBehavior(optionValue: string, disabled: boolean) {
  const context = useListboxContext('ListboxItem')
  const isItemDisabled = disabled || context.disabled
  const isSelected = getSelectedSet(context.value, context.multiple).has(optionValue)
  const isHighlighted = context.activeValue === optionValue

  const selectItem = useCallback(() => {
    if (isItemDisabled || context.readOnly)
      return

    context.setActiveValue(optionValue)

    if (context.multiple) {
      context.onValueChange(toggleSelectedValue(getSelectedValues(context.value, true), optionValue))
      context.setLastSelectedValue(optionValue)
      return
    }

    context.onValueChange(optionValue)
    context.setLastSelectedValue(optionValue)
  }, [context, isItemDisabled, optionValue])

  const handleMouseMove = useCallback(() => {
    if (!isItemDisabled)
      context.setActiveValue(optionValue)
  }, [context, isItemDisabled, optionValue])

  return {
    isHighlighted,
    isItemDisabled,
    isSelected,
    handleMouseMove,
    selectItem,
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
  id: idProp,
  ...props
}: ListboxItemProps & { ref?: Ref<HTMLDivElement> }) {
  const generatedId = useId()
  const id = getElementId(idProp, generatedId)
  const {
    isHighlighted,
    isItemDisabled,
    isSelected,
    handleMouseMove,
    selectItem,
  } = useListboxItemBehavior(optionValue, disabled)

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
}: ListboxGroupProps & { ref?: Ref<HTMLDivElement> }) {
  const [groupLabelId, setGroupLabelId] = useState<string | null>(null)
  const groupProps = {
    ...props,
    'role': 'group',
    'aria-labelledby': groupLabelId || undefined,
  }

  return (
    <ListboxGroupProvider groupLabelId={groupLabelId} setGroupLabelId={setGroupLabelId}>
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
    </ListboxGroupProvider>
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
}: ListboxGroupLabelProps & { ref?: Ref<HTMLDivElement> }) {
  const { setGroupLabelId } = useListboxGroupContext('ListboxGroupLabel')
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
