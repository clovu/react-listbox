import type { ComponentPropsWithoutRef, ReactNode } from 'react'

export type Orientation = 'vertical' | 'horizontal'

interface ListboxRootBaseProps {
  disabled?: boolean
  readOnly?: boolean
  loop?: boolean
  required?: boolean
  orientation?: Orientation
  children: ReactNode
}

export interface SingleListboxRootProps extends ListboxRootBaseProps {
  multiple?: false
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

export interface MultiListboxRootProps extends ListboxRootBaseProps {
  multiple: true
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
}

export type ListboxRootProps = SingleListboxRootProps | MultiListboxRootProps
export type ListboxProps = ListboxRootProps

type DivProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'>

export interface ListboxLabelProps extends DivProps {
  children: ReactNode
  asChild?: boolean
}

export interface ListboxContentProps extends DivProps {
  children: ReactNode
}

export interface ListboxItemProps extends DivProps {
  value: string
  disabled?: boolean
  children: ReactNode
  asChild?: boolean
}

export interface ListboxGroupProps extends DivProps {
  children: ReactNode
  asChild?: boolean
}

export interface ListboxGroupLabelProps extends DivProps {
  children: ReactNode
  asChild?: boolean
}
