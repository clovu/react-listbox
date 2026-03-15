import {
  ListboxContent,
  ListboxGroup,
  ListboxGroupLabel,
  ListboxItem,
  ListboxLabel,
  ListboxRoot,
} from '@listbox/react'
import { useState } from 'react'
import './App.css'

function App() {
  const [singleValue, setSingleValue] = useState('2')
  const [multiValues, setMultiValues] = useState<string[]>(['1', '3'])
  const [groupedValue, setGroupedValue] = useState('apple')

  return (
    <main className="app">
      <h1>Listbox Primitives 验证项目</h1>
      <p className="intro">验证单选、多选、分组、禁用项与键盘交互。</p>

      <section className="card">
        <h2>单选 Listbox（Loop）</h2>
        <ListboxRoot value={singleValue} onValueChange={setSingleValue} loop>
          <ListboxLabel className="label">选择一个选项</ListboxLabel>
          <ListboxContent className="listbox">
            <ListboxItem value="1" className="option">
              Option 1
            </ListboxItem>
            <ListboxItem value="2" className="option">
              Option 2
            </ListboxItem>
            <ListboxItem value="3" disabled className="option option-disabled">
              Option 3 (Disabled)
            </ListboxItem>
            <ListboxItem value="4" className="option">
              Option 4
            </ListboxItem>
          </ListboxContent>
        </ListboxRoot>
        <div className="result">
          当前值:
          {singleValue}
        </div>
      </section>

      <section className="card">
        <h2>多选 Listbox</h2>
        <ListboxRoot multiple value={multiValues} onValueChange={setMultiValues}>
          <ListboxLabel className="label">选择多个选项</ListboxLabel>
          <ListboxContent className="listbox">
            <ListboxItem value="1" className="option">
              Option 1
            </ListboxItem>
            <ListboxItem value="2" className="option">
              Option 2
            </ListboxItem>
            <ListboxItem value="3" className="option">
              Option 3
            </ListboxItem>
            <ListboxItem value="4" className="option">
              Option 4
            </ListboxItem>
          </ListboxContent>
        </ListboxRoot>
        <div className="result">
          当前值:
          {multiValues.join(', ') || 'none'}
        </div>
      </section>

      <section className="card">
        <h2>分组 Listbox</h2>
        <ListboxRoot value={groupedValue} onValueChange={setGroupedValue}>
          <ListboxLabel className="label">选择水果</ListboxLabel>
          <ListboxContent className="listbox">
            <ListboxGroup className="group">
              <ListboxGroupLabel className="group-label">Citrus</ListboxGroupLabel>
              <ListboxItem value="orange" className="option">
                Orange
              </ListboxItem>
              <ListboxItem value="lemon" className="option">
                Lemon
              </ListboxItem>
            </ListboxGroup>

            <ListboxGroup className="group">
              <ListboxGroupLabel className="group-label">Other</ListboxGroupLabel>
              <ListboxItem value="apple" className="option">
                Apple
              </ListboxItem>
              <ListboxItem value="banana" className="option">
                Banana
              </ListboxItem>
            </ListboxGroup>
          </ListboxContent>
        </ListboxRoot>
        <div className="result">
          当前值:
          {groupedValue}
        </div>
      </section>

      <section className="card">
        <h2>只读 Listbox</h2>
        <ListboxRoot readOnly loop>
          <ListboxLabel className="label">只读列表</ListboxLabel>
          <ListboxContent className="listbox listbox-display">
            <ListboxItem value="guide-1" className="option">
              Getting Started
            </ListboxItem>
            <ListboxItem value="guide-2" className="option">
              Components Overview
            </ListboxItem>
            <ListboxItem value="guide-3" className="option">
              Accessibility Notes
            </ListboxItem>
            <ListboxItem value="guide-4" className="option">
              Keyboard Interaction
            </ListboxItem>
            <ListboxItem value="guide-5" className="option">
              Composition Patterns
            </ListboxItem>
            <ListboxItem value="guide-6" className="option">
              Styling Recipes
            </ListboxItem>
            <ListboxItem value="guide-7" className="option">
              State Management
            </ListboxItem>
            <ListboxItem value="guide-8" className="option">
              Testing Checklist
            </ListboxItem>
            <ListboxItem value="guide-9" className="option">
              Migration Guide
            </ListboxItem>
            <ListboxItem value="guide-10" className="option">
              FAQ
            </ListboxItem>
            <ListboxItem value="guide-11" className="option">
              Performance Tips
            </ListboxItem>
            <ListboxItem value="guide-12" className="option">
              Troubleshooting
            </ListboxItem>
          </ListboxContent>
        </ListboxRoot>
        <div className="result">说明: 该列表为只读模式，不可修改选中值。</div>
      </section>

      <section className="card tips">
        <h2>键盘测试点</h2>
        <ul>
          <li>单选: Arrow / Home / End 自动改变选中项</li>
          <li>多选: Arrow 仅移动焦点，Space 切换，Ctrl/Cmd + A 全选</li>
          <li>禁用项应无法选中且被导航跳过</li>
        </ul>
      </section>
    </main>
  )
}

export default App
