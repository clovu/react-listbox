import { Check, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface CodeBlockProps {
  code: string
}

export function CodeBlock({ code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied)
      return

    const timeout = window.setTimeout(setCopied, 1200, false)
    return () => window.clearTimeout(timeout)
  }, [copied])

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
    }
    catch {
      setCopied(false)
    }
  }

  const Icon = copied ? Check : Copy

  return (
    <div className="relative overflow-hidden rounded-lg border bg-muted/35">
      <button
        type="button"
        className={cn(
          'absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-md border bg-background text-muted-foreground shadow-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          copied && 'text-foreground',
        )}
        onClick={copyCode}
        aria-label={copied ? 'Code copied' : 'Copy code'}
        title={copied ? 'Copied' : 'Copy code'}
      >
        <Icon className="size-4" aria-hidden="true" />
      </button>
      <pre className="max-h-96 overflow-auto p-4 pr-12 text-xs leading-6 text-foreground">
        <code>{code}</code>
      </pre>
    </div>
  )
}
