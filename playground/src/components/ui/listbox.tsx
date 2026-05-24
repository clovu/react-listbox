import type { Ref } from 'react'
import type {
  ListboxContentProps,
  ListboxGroupLabelProps,
  ListboxGroupProps,
  ListboxItemProps,
  ListboxLabelProps,
  ListboxRootProps,
} from 'react-listbox-primitives'
import {
  ListboxContent as ListboxPrimitiveContent,
  ListboxGroup as ListboxPrimitiveGroup,
  ListboxGroupLabel as ListboxPrimitiveGroupLabel,
  ListboxItem as ListboxPrimitiveItem,
  ListboxLabel as ListboxPrimitiveLabel,
  ListboxRoot,
} from 'react-listbox-primitives'
import { cn } from '@/lib/utils'

type ContentViewProps = ListboxContentProps & { ref?: Ref<HTMLDivElement> }

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

function ListboxContent({ ref, className, ...props }: ContentViewProps) {
  return (
    <ListboxPrimitiveContent
      ref={ref}
      data-slot="listbox-content"
      className={cn(
        'min-w-0 overflow-x-hidden overflow-y-auto rounded-lg border border-border bg-popover p-1.5 text-popover-foreground shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring data-[orientation=horizontal]:flex data-[orientation=horizontal]:gap-2 data-[orientation=horizontal]:overflow-x-auto data-[orientation=horizontal]:overflow-y-hidden data-disabled:opacity-60',
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
        'relative flex min-h-10 cursor-default items-center gap-2 rounded-md px-2.5 py-2 text-sm outline-hidden select-none transition-colors data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground data-highlighted:bg-muted data-highlighted:text-foreground data-disabled:pointer-events-none data-disabled:opacity-50',
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
