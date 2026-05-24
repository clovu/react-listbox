import type { ComponentPropsWithoutRef, ReactNode } from 'react'

/**
 * The supported listbox orientations.
 */
export type Orientation = 'vertical' | 'horizontal'

/**
 * Shared root props for single- and multi-select listboxes.
 */
interface RootBaseProps {
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
   * Whether single-select focus movement also updates selection.
   *
   * Defaults to true. Set to false when users should commit the active option with Space or Enter.
   */
  selectionFollowsFocus?: boolean
  /**
   * Listbox contents.
   */
  children: ReactNode
}

/**
 * Props for a single-select listbox.
 */
interface SingleRootProps extends RootBaseProps {
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
interface MultiRootProps extends RootBaseProps {
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
export type RootProps = SingleRootProps | MultiRootProps

/**
 * Public props accepted by the root listbox component.
 */
export type ListboxRootProps = RootProps

/**
 * Backward-compatible alias for `ListboxRootProps`.
 */
export type ListboxProps = RootProps

type DivProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'>

/**
 * Props for the label element associated with a listbox.
 */
export interface LabelProps extends DivProps {
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
 * Public props accepted by `ListboxLabel`.
 */
export type ListboxLabelProps = LabelProps

/**
 * Props for the element that renders the listbox options container.
 */
export interface ContentProps extends DivProps {
  /**
   * Content inside the listbox.
   */
  children: ReactNode
}

/**
 * Public props accepted by `ListboxContent`.
 */
export type ListboxContentProps = ContentProps

/**
 * Props for an individual listbox option.
 */
export interface ItemProps extends DivProps {
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
 * Public props accepted by `ListboxItem`.
 */
export type ListboxItemProps = ItemProps

/**
 * Props for a grouped section of listbox options.
 */
export interface GroupProps extends DivProps {
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
 * Public props accepted by `ListboxGroup`.
 */
export type ListboxGroupProps = GroupProps

/**
 * Props for a label inside a grouped listbox section.
 */
export interface GroupLabelProps extends DivProps {
  /**
   * Group label content.
   */
  children: ReactNode
  /**
   * Renders the group label through a child element instead of a plain div.
   */
  asChild?: boolean
}

/**
 * Public props accepted by `ListboxGroupLabel`.
 */
export type ListboxGroupLabelProps = GroupLabelProps
