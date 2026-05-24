/* eslint-disable react-refresh/only-export-components */
import type { ComponentPropsWithoutRef, ReactNode, Ref } from 'react'
import type { OptionRecord } from './behavior'
import { composeRefs } from '@radix-ui/react-compose-refs'
import { createContext } from '@radix-ui/react-context'
import { Primitive } from '@radix-ui/react-primitive'
import { Slot } from '@radix-ui/react-slot'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export interface CollectionItem extends OptionRecord {
  /**
   * DOM node that owns this option record.
   */
  element: HTMLElement
}

interface CollectionContextValue {
  /**
   * Root node used to determine DOM order for registered options.
   */
  collectionRef: React.RefObject<HTMLDivElement | null>
  /**
   * Registered option metadata keyed by its DOM element.
   */
  itemMap: Map<HTMLElement, OptionRecord>
  /**
   * Adds or updates an option record in the collection.
   */
  registerItem: (node: HTMLElement, itemData: OptionRecord) => void
  /**
   * Removes an option record from the collection.
   */
  unregisterItem: (node: HTMLElement) => void
  /**
   * Monotonic marker used to refresh collection reads after registration changes.
   */
  version: number
}

const [CollectionProviderImpl, useCollectionContext] = createContext<CollectionContextValue>('Collection')

function CollectionProvider({ children }: { children: ReactNode }) {
  const collectionRef = useRef<HTMLDivElement>(null)
  const [itemMap] = useState(() => new Map<HTMLElement, OptionRecord>())
  const [version, setVersion] = useState(0)

  const registerItem = useCallback((node: HTMLElement, itemData: OptionRecord) => {
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
  }, [itemMap])

  const unregisterItem = useCallback((node: HTMLElement) => {
    if (itemMap.delete(node))
      setVersion(v => v + 1)
  }, [itemMap])

  const contextValue = useMemo(() => ({
    collectionRef,
    itemMap,
    registerItem,
    unregisterItem,
    version,
  }), [collectionRef, itemMap, registerItem, unregisterItem, version])

  return <CollectionProviderImpl {...contextValue}>{children}</CollectionProviderImpl>
}

interface CollectionSlotProps extends ComponentPropsWithoutRef<'div'> {
  /**
   * Optional forwarded ref for the collection root element.
   */
  ref?: Ref<HTMLDivElement>
}

function CollectionSlot({ ref: forwardedRef, ...props }: CollectionSlotProps) {
  const { collectionRef } = useCollectionContext('CollectionSlot')
  return <Primitive.div ref={composeRefs(collectionRef, forwardedRef)} {...props} />
}

interface CollectionItemSlotProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  /**
   * Option metadata registered for keyboard navigation and typeahead.
   */
  itemData: OptionRecord
  /**
   * Rendered option content.
   */
  children: ReactNode
  /**
   * Renders the option through the child element instead of a default div.
   */
  asChild?: boolean
  /**
   * Optional forwarded ref for the option element.
   */
  ref?: Ref<HTMLDivElement>
}

function CollectionItemSlot({ ref: forwardedRef, itemData, children, asChild = false, ...props }: CollectionItemSlotProps) {
  const { registerItem, unregisterItem } = useCollectionContext('CollectionItemSlot')
  const itemRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = itemRef.current

    if (!node)
      return

    registerItem(node, {
      ...itemData,
      textValue: itemData.textValue || node.textContent || itemData.value,
    })

    return () => unregisterItem(node)
  }, [itemData, registerItem, unregisterItem])

  if (asChild) {
    return (
      <Slot
        ref={composeRefs(itemRef, forwardedRef)}
        {...props}
      >
        {children}
      </Slot>
    )
  }

  return (
    <Primitive.div
      ref={composeRefs(itemRef, forwardedRef)}
      {...props}
    >
      {children}
    </Primitive.div>
  )
}

function getSortedItems(collectionNode: HTMLDivElement | null, itemMap: Map<HTMLElement, OptionRecord>) {
  if (!collectionNode)
    return [] as CollectionItem[]

  // DOM position is the source of truth because React children can be nested in groups.
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
}

CollectionProvider.displayName = 'CollectionProvider'
CollectionSlot.displayName = 'CollectionSlot'
CollectionItemSlot.displayName = 'CollectionItemSlot'

const Collection = {
  Provider: CollectionProvider,
  Slot: CollectionSlot,
  ItemSlot: CollectionItemSlot,
}

function useCollection() {
  const { collectionRef, itemMap, version } = useCollectionContext('useCollection')
  const items = useMemo(() => {
    // `itemMap` is mutated in place; `version` is the cache key for sorted reads.
    void version
    return getSortedItems(collectionRef.current, itemMap)
  }, [collectionRef, itemMap, version])

  return useCallback(() => items, [items])
}

export {
  Collection,
  useCollection,
}
