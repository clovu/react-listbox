import type { ReactNode } from 'react'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'

interface DemoCardProps {
  title: string
  children: ReactNode
  action?: ReactNode
  className?: string
  contentClassName?: string
  description?: ReactNode
  footer?: ReactNode
  footerClassName?: string
  size?: 'default' | 'sm'
}

export function DemoCard({
  title,
  action,
  children,
  className,
  contentClassName,
  description,
  footer,
  footerClassName,
  size,
}: DemoCardProps) {
  return (
    <Card size={size} className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
      {footer ? <CardFooter className={footerClassName}>{footer}</CardFooter> : null}
    </Card>
  )
}
