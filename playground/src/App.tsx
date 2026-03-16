import { useEffect, useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './components/ui/card'
import {
  ListboxContent,
  ListboxGroup,
  ListboxGroupLabel,
  ListboxItem,
  ListboxLabel,
  ListboxRoot,
} from './components/ui/listbox'

type ThemePreference = 'light' | 'dark' | 'system'

const THEME_STORAGE_KEY = 'playground-theme'

function isThemePreference(value: string): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system'
}

function App() {
  const [singleValue, setSingleValue] = useState('2')
  const [multiValues, setMultiValues] = useState<string[]>(['1', '3'])
  const [groupedValue, setGroupedValue] = useState('apple')
  const [themePreference, setThemePreference] = useState<ThemePreference>(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    return stored && isThemePreference(stored) ? stored : 'system'
  })

  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const applyTheme = () => {
      const shouldUseDark = themePreference === 'dark' || (themePreference === 'system' && media.matches)
      root.classList.toggle('dark', shouldUseDark)
    }

    applyTheme()
    window.localStorage.setItem(THEME_STORAGE_KEY, themePreference)

    if (themePreference !== 'system') {
      return
    }

    const handleChange = () => {
      applyTheme()
    }

    media.addEventListener('change', handleChange)
    return () => {
      media.removeEventListener('change', handleChange)
    }
  }, [themePreference])

  return (
    <main className="min-h-screen bg-linear-to-b from-background to-muted/30 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4">
        <section className="space-y-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight">Listbox Primitives 验证项目</h1>
              <p className="text-sm text-muted-foreground md:text-base">
                验证单选、多选、分组、禁用项与键盘交互。
              </p>
            </div>

            <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1">
              {(['system', 'light', 'dark'] as const).map((mode) => {
                const label = mode === 'system' ? '系统' : mode === 'light' ? '浅色' : '暗色'
                const isActive = themePreference === mode

                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setThemePreference(mode)}
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
        </section>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>单选 Listbox（Loop）</CardTitle>
          </CardHeader>
          <CardContent>
            <ListboxRoot value={singleValue} onValueChange={setSingleValue} loop>
              <ListboxLabel>选择一个选项</ListboxLabel>
              <ListboxContent>
                <ListboxItem value="1">
                  Option 1
                </ListboxItem>
                <ListboxItem value="2">
                  Option 2
                </ListboxItem>
                <ListboxItem value="3" disabled>
                  Option 3 (Disabled)
                </ListboxItem>
                <ListboxItem value="4">
                  Option 4
                </ListboxItem>
              </ListboxContent>
            </ListboxRoot>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground">
              当前值:
              {' '}
              <span className="font-medium text-foreground">{singleValue}</span>
            </div>
          </CardFooter>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>多选 Listbox</CardTitle>
          </CardHeader>
          <CardContent>
            <ListboxRoot multiple value={multiValues} onValueChange={setMultiValues}>
              <ListboxLabel>选择多个选项</ListboxLabel>
              <ListboxContent>
                <ListboxItem value="1">
                  Option 1
                </ListboxItem>
                <ListboxItem value="2">
                  Option 2
                </ListboxItem>
                <ListboxItem value="3">
                  Option 3
                </ListboxItem>
                <ListboxItem value="4">
                  Option 4
                </ListboxItem>
              </ListboxContent>
            </ListboxRoot>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground">
              当前值:
              {' '}
              <span className="font-medium text-foreground">{multiValues.join(', ') || 'none'}</span>
            </div>
          </CardFooter>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>分组 Listbox</CardTitle>
          </CardHeader>
          <CardContent>
            <ListboxRoot value={groupedValue} onValueChange={setGroupedValue}>
              <ListboxLabel>选择水果</ListboxLabel>
              <ListboxContent>
                <ListboxGroup className="mb-2 last:mb-0">
                  <ListboxGroupLabel className="px-3 py-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Citrus
                  </ListboxGroupLabel>
                  <ListboxItem value="orange">
                    Orange
                  </ListboxItem>
                  <ListboxItem value="lemon">
                    Lemon
                  </ListboxItem>
                </ListboxGroup>

                <ListboxGroup className="mb-2 last:mb-0">
                  <ListboxGroupLabel className="px-3 py-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Other
                  </ListboxGroupLabel>
                  <ListboxItem value="apple">
                    Apple
                  </ListboxItem>
                  <ListboxItem value="banana">
                    Banana
                  </ListboxItem>
                </ListboxGroup>
              </ListboxContent>
            </ListboxRoot>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground">
              当前值:
              {' '}
              <span className="font-medium text-foreground">{groupedValue}</span>
            </div>
          </CardFooter>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>只读 Listbox</CardTitle>
          </CardHeader>
          <CardContent>
            <ListboxRoot readOnly loop>
              <ListboxLabel>只读列表</ListboxLabel>
              <ListboxContent className="max-h-72">
                <ListboxItem value="guide-1">
                  Getting Started
                </ListboxItem>
                <ListboxItem value="guide-2">
                  Components Overview
                </ListboxItem>
                <ListboxItem value="guide-3">
                  Accessibility Notes
                </ListboxItem>
                <ListboxItem value="guide-4">
                  Keyboard Interaction
                </ListboxItem>
                <ListboxItem value="guide-5">
                  Composition Patterns
                </ListboxItem>
                <ListboxItem value="guide-6">
                  Styling Recipes
                </ListboxItem>
                <ListboxItem value="guide-7">
                  State Management
                </ListboxItem>
                <ListboxItem value="guide-8">
                  Testing Checklist
                </ListboxItem>
                <ListboxItem value="guide-9">
                  Migration Guide
                </ListboxItem>
                <ListboxItem value="guide-10">
                  FAQ
                </ListboxItem>
                <ListboxItem value="guide-11">
                  Performance Tips
                </ListboxItem>
                <ListboxItem value="guide-12">
                  Troubleshooting
                </ListboxItem>
              </ListboxContent>
            </ListboxRoot>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-muted-foreground">说明: 该列表为只读模式，不可修改选中值。</div>
          </CardFooter>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>键盘测试点</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>单选: Arrow / Home / End 自动改变选中项</li>
              <li>多选: Arrow 仅移动焦点，Space 切换，Ctrl/Cmd + A 全选</li>
              <li>禁用项应无法选中且被导航跳过</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default App
