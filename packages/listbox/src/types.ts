import type { ComponentPropsWithoutRef, ReactNode } from 'react'

/**
 * The supported listbox orientations.
 */
export type Orientation = 'vertical' | 'horizontal'

/**
 * Shared root props for single- and multi-select listboxes.
 */
interface ListboxRootBaseProps {
  /**
   * Disables interaction for the entire listbox.
   */
  disabled?: boolean
  /**
   * Makes the listbox read-only while keeping focus and navigation available.
   */
  readOnly?: boolean
  /**
   * Wraps keyboard navigation from the last item back to the first item.
   */
  loop?: boolean
  /**
   * Marks the listbox as required for form-like usage.
   */
  required?: boolean
  /**
   * Controls whether arrow keys move vertically or horizontally.
   */
  orientation?: Orientation
  /**
   * Listbox contents.
   */
  children: ReactNode
}

/**
 * Props for a single-select listbox.
 */
export interface SingleListboxRootProps extends ListboxRootBaseProps {
  /**
   * Enables single-selection mode.
   */
  multiple?: false
  /**
   * Controlled selected value.
   */
  value?: string
  /**
   * Uncontrolled initial selected value.
   */
  defaultValue?: string
  /**
   * Called whenever the selected value changes.
   */
  onValueChange?: (value: string) => void
}

/**
 * Props for a multi-select listbox.
 */
export interface MultiListboxRootProps extends ListboxRootBaseProps {
  /**
   * Enables multi-selection mode.
   */
  multiple: true
  /**
   * Controlled selected values.
   */
  value?: string[]
  /**
   * Uncontrolled initial selected values.
   */
  defaultValue?: string[]
  /**
   * Called whenever the selected values change.
   */
  onValueChange?: (value: string[]) => void
}

/**
 * Props accepted by the root listbox component.
 */
export type ListboxRootProps = SingleListboxRootProps | MultiListboxRootProps

/**
 * Backward-compatible alias for `ListboxRootProps`.
 */
export type ListboxProps = ListboxRootProps

type DivProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'>

/**
 * Props for the label element associated with a listbox.
 */
export interface ListboxLabelProps extends DivProps {
  /**
   * Label content.
   */
  children: ReactNode
  /**
   * Renders the label through a child element instead of a plain div.
   */
  asChild?: boolean
}

/**
 * Props for the element that renders the listbox options container.
 */
export interface ListboxContentProps extends DivProps {
  /**
   * Content inside the listbox.
   */
  children: ReactNode
}

/**
 * Props for an individual listbox option.
 */
export interface ListboxItemProps extends DivProps {
  /**
   * Option value used for selection.
   */
  value: string
  /**
   * Disables the option.
   */
  disabled?: boolean
  /**
   * Accessible text used for typeahead when the rendered children are not plain text.
   */
  textValue?: string
  /**
   * Option content.
   */
  children: ReactNode
  /**
   * Renders the option through a child element instead of a plain div.
   */
  asChild?: boolean
}

/**
 * Props for a grouped section of listbox options.
 */
export interface ListboxGroupProps extends DivProps {
  /**
   * Group contents.
   */
  children: ReactNode
  /**
   * Renders the group through a child element instead of a plain div.
   */
  asChild?: boolean
}

/**
 * Props for a label inside a grouped listbox section.
 */
export interface ListboxGroupLabelProps extends DivProps {
  /**
   * Group label content.
   */
  children: ReactNode
  /**
   * Renders the group label through a child element instead of a plain div.
   */
  asChild?: boolean
}
