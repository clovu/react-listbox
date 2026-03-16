import type {
  ListboxContentProps,
  ListboxGroupLabelProps,
  ListboxGroupProps,
  ListboxItemProps,
  ListboxLabelProps,
  ListboxRootProps,
} from '@listbox/react'
import {
  ListboxContent as ListboxPrimitiveContent,
  ListboxGroup as ListboxPrimitiveGroup,
  ListboxGroupLabel as ListboxPrimitiveGroupLabel,
  ListboxItem as ListboxPrimitiveItem,
  ListboxLabel as ListboxPrimitiveLabel,
  ListboxRoot,
} from '@listbox/react'
import { cn } from '@/lib/utils'

function Listbox({ children, ...props }: ListboxRootProps) {
  return <ListboxRoot {...props}>{children}</ListboxRoot>
}

function ListboxLabel({ className, ...props }: ListboxLabelProps) {
  return (
    <ListboxPrimitiveLabel
      data-slot="listbox-label"
      className={cn('mb-2 block px-1 text-sm font-medium text-foreground', className)}
      {...props}
    />
  )
}

function ListboxContent({ className, ...props }: ListboxContentProps) {
  return (
    <ListboxPrimitiveContent
      data-slot="listbox-content"
      className={cn(
        'overflow-x-hidden overflow-y-auto rounded-xl border border-border bg-popover p-2 text-popover-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring',
        className,
      )}
      {...props}
    />
  )
}

function ListboxItem({ className, ...props }: ListboxItemProps) {
  return (
    <ListboxPrimitiveItem
      data-slot="listbox-item"
      className={cn(
        'relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 h-9 text-sm outline-hidden select-none data-highlighted:bg-muted data-highlighted:text-foreground data-[state=checked]:bg-muted data-[state=checked]:text-foreground data-disabled:pointer-events-none data-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

function ListboxGroup({ className, ...props }: ListboxGroupProps) {
  return (
    <ListboxPrimitiveGroup
      data-slot="listbox-group"
      className={cn('overflow-hidden p-1 text-foreground', className)}
      {...props}
    />
  )
}

function ListboxGroupLabel({ className, ...props }: ListboxGroupLabelProps) {
  return (
    <ListboxPrimitiveGroupLabel
      data-slot="listbox-group-label"
      className={cn('px-2 py-1.5 text-xs font-medium text-muted-foreground', className)}
      {...props}
    />
  )
}

export {
  Listbox,
  ListboxContent,
  ListboxGroup,
  ListboxGroupLabel,
  ListboxItem,
  ListboxLabel,
  ListboxRoot,
}

export type {
  ListboxContentProps,
  ListboxGroupLabelProps,
  ListboxGroupProps,
  ListboxItemProps,
  ListboxLabelProps,
  ListboxRootProps,
}
