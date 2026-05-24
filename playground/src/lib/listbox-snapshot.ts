export interface ListboxSnapshot {
  activeOption: string
  selectedOptions: string[]
  attributes: Record<string, string>
}

export const EMPTY_SNAPSHOT: ListboxSnapshot = {
  activeOption: 'none',
  selectedOptions: [],
  attributes: {},
}

function getOptionLabelById(id: string | null) {
  if (!id)
    return 'none'

  const option = document.getElementById(id)

  return option?.getAttribute('data-label') || option?.textContent?.trim() || id
}

export function readListboxSnapshot(node: HTMLDivElement | null): ListboxSnapshot {
  if (!node)
    return EMPTY_SNAPSHOT

  const activeId = node.getAttribute('aria-activedescendant')
  const selectedOptions = Array.from(
    node.querySelectorAll<HTMLElement>('[role="option"][aria-selected="true"]'),
    option => option.getAttribute('data-label') || option.textContent?.trim() || option.id,
  )

  return {
    activeOption: getOptionLabelById(activeId),
    selectedOptions,
    attributes: {
      'aria-activedescendant': activeId ?? 'none',
      'aria-disabled': node.getAttribute('aria-disabled') ?? 'false',
      'aria-multiselectable': node.getAttribute('aria-multiselectable') ?? 'false',
      'aria-orientation': node.getAttribute('aria-orientation') ?? 'vertical',
      'aria-readonly': node.getAttribute('aria-readonly') ?? 'false',
      'aria-required': node.getAttribute('aria-required') ?? 'false',
      'data-value': node.getAttribute('data-value') ?? 'none',
      'tabIndex': node.getAttribute('tabindex') ?? '0',
    },
  }
}

export function snapshotReducer(_state: ListboxSnapshot, nextSnapshot: ListboxSnapshot) {
  return nextSnapshot
}
