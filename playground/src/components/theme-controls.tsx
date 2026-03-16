interface ThemeControlsProps {
  themePreference: 'light' | 'dark' | 'system'
  onChange: (value: 'light' | 'dark' | 'system') => void
}

export function ThemeControls({ themePreference, onChange }: ThemeControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <a
        href="https://github.com/clovu/react-listbox"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        GitHub
      </a>

      <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1">
        {(['system', 'light', 'dark'] as const).map((mode) => {
          const label = mode.charAt(0).toUpperCase() + mode.slice(1)
          const isActive = themePreference === mode

          return (
            <button
              key={mode}
              type="button"
              onClick={() => onChange(mode)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
              aria-pressed={isActive}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
