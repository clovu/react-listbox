import type {
  ComponentPropsWithoutRef,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  Ref,
  RefObject,
} from 'react'
import type {
  ListboxContentProps,
  ListboxGroupLabelProps,
  ListboxGroupProps,
  ListboxItemProps,
  ListboxLabelProps,
  ListboxRootProps,
  Orientation,
} from './types'
import { composeRefs } from '@radix-ui/react-compose-refs'
import { createContext } from '@radix-ui/react-context'
import { Primitive } from '@radix-ui/react-primitive'
import { Slot } from '@radix-ui/react-slot'
import { useControllableState } from '@radix-ui/react-use-controllable-state'
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'

interface ListboxContextValue {
  value: string | string[]
  onValueChange: (value: string | string[]) => void
  multiple: boolean
  activeValue: string | null
  setActiveValue: (value: string | null) => void
  listboxId: string
  labelId: string | null
  setLabelId: (id: string | null) => void
  disabled: boolean
  readOnly: boolean
  loop: boolean
  orientation: Orientation
  required: boolean
}

interface ListboxGroupContextValue {
  groupLabelId: string | null
  setGroupLabelId: (id: string | null) => void
}

interface CollectionItemData {
  value: string
  disabled: boolean
  textValue: string
  id: string
}

interface CollectionContextValue {
  collectionRef: RefObject<HTMLDivElement | null>
  itemMap: Map<HTMLElement, CollectionItemData>
  registerItem: (node: HTMLElement, itemData: CollectionItemData) => void
  unregisterItem: (node: HTMLElement) => void
  version: number
}

interface CollectionItem extends CollectionItemData {
  element: HTMLElement
}

const [ListboxProvider, useListboxContext] = createContext<ListboxContextValue>('Listbox')
const [ListboxGroupProvider, useListboxGroupContext]
  = createContext<ListboxGroupContextValue>('ListboxGroup')
const [CollectionProviderImpl, useCollectionContext] = createContext<CollectionContextValue>('ListboxCollection')

function CollectionProvider({ children }: { children: ReactNode }) {
  const collectionRef = useRef<HTMLDivElement>(null)
  const [itemMap] = useState(() => new Map<HTMLElement, CollectionItemData>())
  const [version, setVersion] = useState(0)

  const registerItem = useCallback(
    (node: HTMLElement, itemData: CollectionItemData) => {
      const prevItemData = itemMap.get(node)

      if (
        prevItemData
        && prevItemData.value === itemData.value
        && prevItemData.disabled === itemData.disabled
        && prevItemData.textValue === itemData.textValue
        && prevItemData.id === itemData.id
      ) {
        return
      }

      itemMap.set(node, itemData)
      setVersion(v => v + 1)
    },
    [itemMap],
  )

  const unregisterItem = useCallback(
    (node: HTMLElement) => {
      const didDelete = itemMap.delete(node)
      if (didDelete) {
        setVersion(v => v + 1)
      }
    },
    [itemMap],
  )

  const contextValue = useMemo(
    () => ({
      collectionRef,
      itemMap,
      registerItem,
      unregisterItem,
      version,
    }),
    [collectionRef, itemMap, registerItem, unregisterItem, version],
  )

  return <CollectionProviderImpl {...contextValue}>{children}</CollectionProviderImpl>
}

type CollectionSlotProps = ComponentPropsWithoutRef<'div'> & { ref?: Ref<HTMLDivElement> }

function CollectionSlot({ ref: forwardedRef, ...props }: CollectionSlotProps) {
  const { collectionRef } = useCollectionContext('CollectionSlot')
  return <Primitive.div ref={composeRefs(collectionRef, forwardedRef)} {...props} />
}

CollectionSlot.displayName = 'CollectionSlot'

interface CollectionItemSlotProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  itemData: CollectionItemData
  children: ReactNode
  asChild?: boolean
}

function CollectionItemSlot({ ref: forwardedRef, itemData, children, asChild = false, ...props }: CollectionItemSlotProps & { ref?: Ref<HTMLDivElement> }) {
  const { registerItem, unregisterItem } = useCollectionContext('CollectionItemSlot')
  const itemRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = itemRef.current
    if (!node)
      return

    registerItem(node, {
      ...itemData,
      textValue: node.textContent || itemData.textValue,
    })
    return () => unregisterItem(node)
  }, [itemData, registerItem, unregisterItem])

  if (asChild) {
    return (
      <Slot ref={composeRefs(itemRef, forwardedRef)} {...props}>
        {children}
      </Slot>
    )
  }

  return (
    <Primitive.div ref={composeRefs(itemRef, forwardedRef)} {...props}>
      {children}
    </Primitive.div>
  )
}

CollectionItemSlot.displayName = 'CollectionItemSlot'

const Collection = {
  Provider: CollectionProvider,
  Slot: CollectionSlot,
  ItemSlot: CollectionItemSlot,
}

function useCollection() {
  const { collectionRef, itemMap, version } = useCollectionContext('useCollection')

  return useCallback(() => {
    void version
    const collectionNode = collectionRef.current
    if (!collectionNode)
      return [] as CollectionItem[]

    return [...itemMap.keys()]
      .filter(node => collectionNode.contains(node))
      .sort((a, b) => {
        if (a === b)
          return 0
        const position = a.compareDocumentPosition(b)
        if (position & Node.DOCUMENT_POSITION_FOLLOWING)
          return -1
        if (position & Node.DOCUMENT_POSITION_PRECEDING)
          return 1
        return 0
      })
      .map(element => ({
        element,
        ...itemMap.get(element)!,
      }))
  }, [collectionRef, itemMap, version])
}

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
  const listboxId = useId()
  const [labelId, setLabelId] = useState<string | null>(null)

  const [value, setValue] = useControllableState<string | string[]>({
    prop: controlledValue,
    defaultProp: defaultValue ?? (multiple ? [] : ''),
    onChange: onValueChange as ((value: string | string[]) => void) | undefined,
  })

  const [activeValue, setActiveValue] = useState<string | null>(null)

  const contextValue = useMemo(
    () => ({
      value,
      onValueChange: setValue,
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
    }),
    [value, setValue, multiple, activeValue, listboxId, labelId, disabled, readOnly, loop, orientation, required],
  )

  return (
    <Collection.Provider>
      <ListboxProvider {...contextValue}>{children}</ListboxProvider>
    </Collection.Provider>
  )
}

export const Listbox = ListboxRoot

export function ListboxLabel({ ref, children, asChild = false, ...props }: ListboxLabelProps & { ref?: Ref<HTMLDivElement> }) {
  const { setLabelId } = useListboxContext('ListboxLabel')
  const id = useId()

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

export function ListboxContent({ ref, children, ...props }: ListboxContentProps & { ref?: Ref<HTMLDivElement> }) {
  const {
    value,
    onValueChange,
    multiple,
    activeValue,
    setActiveValue,
    listboxId,
    labelId,
    disabled,
    readOnly,
    loop,
    orientation,
    required,
  } = useListboxContext('ListboxContent')

  const getItems = useCollection()

  const getEnabledItems = useCallback(() => getItems().filter(item => !item.disabled), [getItems])

  const scrollToValue = useCallback(
    (itemValue: string) => {
      const item = getItems().find(entry => entry.value === itemValue)
      if (item) {
        item.element.scrollIntoView({
          block: 'nearest',
          inline: 'nearest',
        })
      }
    },
    [getItems],
  )

  const handleFocus = useCallback(() => {
    if (activeValue)
      return

    const enabledItems = getEnabledItems()
    if (enabledItems.length === 0)
      return

    if (multiple && Array.isArray(value)) {
      const firstSelected = enabledItems.find(item => value.includes(item.value))
      setActiveValue(firstSelected?.value || enabledItems[0].value)
    }
    else if (typeof value === 'string' && value) {
      const selectedItem = enabledItems.find(item => item.value === value)
      setActiveValue(selectedItem?.value || enabledItems[0].value)
    }
    else {
      setActiveValue(enabledItems[0].value)
    }
  }, [activeValue, getEnabledItems, multiple, setActiveValue, value])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (disabled)
        return

      const enabledItems = getEnabledItems()
      if (enabledItems.length === 0)
        return

      const currentIndex = activeValue ? enabledItems.findIndex(item => item.value === activeValue) : -1
      const isVertical = orientation === 'vertical'
      const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight'
      const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft'

      switch (event.key) {
        case nextKey: {
          event.preventDefault()
          let nextIndex = currentIndex + 1
          if (loop && nextIndex >= enabledItems.length) {
            nextIndex = 0
          }
          if (nextIndex < enabledItems.length) {
            const nextValue = enabledItems[nextIndex].value
            setActiveValue(nextValue)
            scrollToValue(nextValue)
          }
          break
        }
        case prevKey: {
          event.preventDefault()
          let prevIndex = currentIndex - 1
          if (loop && prevIndex < 0) {
            prevIndex = enabledItems.length - 1
          }
          if (prevIndex >= 0) {
            const prevValue = enabledItems[prevIndex].value
            setActiveValue(prevValue)
            scrollToValue(prevValue)
          }
          break
        }
        case 'Home': {
          event.preventDefault()
          const firstValue = enabledItems[0]?.value
          if (firstValue) {
            setActiveValue(firstValue)
            scrollToValue(firstValue)
          }
          break
        }
        case 'End': {
          event.preventDefault()
          const lastValue = enabledItems.at(-1)?.value
          if (lastValue) {
            setActiveValue(lastValue)
            scrollToValue(lastValue)
          }
          break
        }
        case 'Enter': {
          if (!readOnly && !multiple && activeValue) {
            event.preventDefault()
            onValueChange(activeValue)
          }
          break
        }
        case ' ': {
          if (!readOnly && multiple && activeValue) {
            event.preventDefault()
            const currentValues = Array.isArray(value) ? value : []
            const newValues = currentValues.includes(activeValue)
              ? currentValues.filter(v => v !== activeValue)
              : [...currentValues, activeValue]
            onValueChange(newValues)
          }
          else if (!readOnly && !multiple && activeValue) {
            event.preventDefault()
            onValueChange(activeValue)
          }
          break
        }
        case 'a':
        case 'A': {
          if (!readOnly && multiple && (event.ctrlKey || event.metaKey)) {
            event.preventDefault()
            onValueChange(enabledItems.map(item => item.value))
          }
          break
        }
      }
    },
    [
      disabled,
      readOnly,
      loop,
      getEnabledItems,
      activeValue,
      orientation,
      setActiveValue,
      scrollToValue,
      multiple,
      onValueChange,
      value,
    ],
  )

  const activeDescendantId = activeValue ? getItems().find(item => item.value === activeValue)?.id : undefined

  const handleMouseLeave = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (event.currentTarget.contains(event.relatedTarget as Node | null))
        return
      setActiveValue(null)
    },
    [setActiveValue],
  )

  return (
    <Primitive.div
      ref={ref}
      role="listbox"
      id={listboxId}
      aria-labelledby={labelId || undefined}
      aria-multiselectable={multiple || undefined}
      aria-activedescendant={activeDescendantId}
      aria-orientation={orientation}
      aria-disabled={disabled || undefined}
      aria-readonly={readOnly || undefined}
      aria-required={required || undefined}
      tabIndex={disabled ? -1 : 0}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      onMouseLeave={handleMouseLeave}
      data-disabled={disabled ? '' : undefined}
      data-orientation={orientation}
      {...props}
    >
      <Collection.Slot>{children}</Collection.Slot>
    </Primitive.div>
  )
}

ListboxContent.displayName = 'ListboxContent'

export const ListboxList = ListboxContent

export function ListboxItem({ ref: forwardedRef, value: optionValue, disabled = false, children, asChild = false, ...props }: ListboxItemProps & { ref?: Ref<HTMLDivElement> }) {
  const {
    value,
    onValueChange,
    multiple,
    activeValue,
    setActiveValue,
    disabled: listboxDisabled,
    readOnly,
  } = useListboxContext('ListboxItem')

  const id = useId()

  const isSelected = multiple ? Array.isArray(value) && value.includes(optionValue) : value === optionValue

  const isHighlighted = activeValue === optionValue

  const handleMouseMove = useCallback(() => {
    if (disabled || listboxDisabled)
      return
    setActiveValue(optionValue)
  }, [disabled, listboxDisabled, setActiveValue, optionValue])

  const handleClick = useCallback(() => {
    if (disabled || listboxDisabled || readOnly)
      return

    setActiveValue(optionValue)

    if (multiple) {
      const currentValues = Array.isArray(value) ? value : []
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue]
      onValueChange(newValues)
    }
    else {
      onValueChange(optionValue)
    }
  }, [disabled, listboxDisabled, readOnly, setActiveValue, optionValue, multiple, value, onValueChange])

  const itemData = useMemo(
    () => ({
      value: optionValue,
      disabled,
      textValue: '',
      id,
    }),
    [optionValue, disabled, id],
  )

  if (asChild) {
    return (
      <Collection.ItemSlot asChild itemData={itemData} ref={composeRefs(forwardedRef)}>
        <Slot
          role="option"
          id={id}
          aria-selected={isSelected}
          aria-disabled={disabled || undefined}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          data-state={isSelected ? 'checked' : 'unchecked'}
          data-highlighted={isHighlighted ? '' : undefined}
          data-disabled={disabled ? '' : undefined}
          {...props}
        >
          {children}
        </Slot>
      </Collection.ItemSlot>
    )
  }

  return (
    <Collection.ItemSlot
      itemData={itemData}
      ref={composeRefs(forwardedRef)}
      role="option"
      id={id}
      aria-selected={isSelected}
      aria-disabled={disabled || undefined}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      data-state={isSelected ? 'checked' : 'unchecked'}
      data-highlighted={isHighlighted ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      {...props}
    >
      {children}
    </Collection.ItemSlot>
  )
}

ListboxItem.displayName = 'ListboxItem'

export const ListboxOption = ListboxItem

export function ListboxGroup({ ref, children, asChild = false, ...props }: ListboxGroupProps & { ref?: Ref<HTMLDivElement> }) {
  const [groupLabelId, setGroupLabelId] = useState<string | null>(null)

  if (asChild) {
    return (
      <ListboxGroupProvider groupLabelId={groupLabelId} setGroupLabelId={setGroupLabelId}>
        <Slot
          ref={ref}
          role="group"
          aria-labelledby={groupLabelId || undefined}
          data-slot="listbox-group"
          {...props}
        >
          {children}
        </Slot>
      </ListboxGroupProvider>
    )
  }

  return (
    <ListboxGroupProvider groupLabelId={groupLabelId} setGroupLabelId={setGroupLabelId}>
      <Primitive.div
        ref={ref}
        role="group"
        aria-labelledby={groupLabelId || undefined}
        data-slot="listbox-group"
        {...props}
      >
        {children}
      </Primitive.div>
    </ListboxGroupProvider>
  )
}

ListboxGroup.displayName = 'ListboxGroup'

export function ListboxGroupLabel({ ref, children, asChild = false, ...props }: ListboxGroupLabelProps & { ref?: Ref<HTMLDivElement> }) {
  const { setGroupLabelId } = useListboxGroupContext('ListboxGroupLabel')
  const id = useId()

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
