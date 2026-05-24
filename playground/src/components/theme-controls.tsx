import { ExternalLink, Monitor, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ThemePreference = 'light' | 'dark' | 'system'

interface ThemeControlsProps {
  themePreference: ThemePreference
  onChange: (value: ThemePreference) => void
}

const themeOptions = [
  { value: 'system', label: 'System theme', icon: Monitor },
  { value: 'light', label: 'Light theme', icon: Sun },
  { value: 'dark', label: 'Dark theme', icon: Moon },
] as const

export function ThemeControls({ themePreference, onChange }: ThemeControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <a
        href="https://github.com/clovu/react-listbox"
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ExternalLink className="size-4" aria-hidden="true" data-icon="inline-start" />
        GitHub
      </a>

      <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-background p-1">
        {themeOptions.map((option) => {
          const isActive = themePreference === option.value
          const Icon = option.icon

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                'inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
              )}
              aria-pressed={isActive}
              aria-label={option.label}
              title={option.label}
            >
              <Icon className="size-4" aria-hidden="true" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
