import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  ListboxContent,
  ListboxGroup,
  ListboxGroupLabel,
  ListboxItem,
  ListboxLabel,
  ListboxRoot,
} from './listbox'

interface TestOption {
  value: string
  label: string
  disabled?: boolean
}

const fruitOptions: TestOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'lime', label: 'Lime', disabled: true },
  { value: 'banana', label: 'Banana' },
  { value: 'blueberry', label: 'Blueberry' },
  { value: 'cherry', label: 'Cherry' },
]

function renderSingleListbox(options: TestOption[] = fruitOptions) {
  const onValueChange = vi.fn()

  render(
    <ListboxRoot defaultValue="apple" loop onValueChange={onValueChange}>
      <ListboxLabel>Choose fruit</ListboxLabel>
      <ListboxContent>
        {options.map(option => (
          <ListboxItem key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </ListboxItem>
        ))}
      </ListboxContent>
    </ListboxRoot>,
  )

  return {
    listbox: screen.getByRole('listbox', { name: 'Choose fruit' }),
    onValueChange,
  }
}

function getOption(name: string) {
  return screen.getByRole('option', { name })
}

function getActiveOption(listbox: HTMLElement) {
  const activeId = listbox.getAttribute('aria-activedescendant')

  expect(activeId).toBeTruthy()

  const activeOption = document.getElementById(activeId!)

  expect(activeOption).toBeTruthy()

  return activeOption!
}

describe('listbox primitives', () => {
  it('renders APG listbox, option, label, and group semantics', () => {
    render(
      <ListboxRoot defaultValue="orange">
        <ListboxLabel>Choose fruit</ListboxLabel>
        <ListboxContent>
          <ListboxGroup>
            <ListboxGroupLabel>Citrus</ListboxGroupLabel>
            <ListboxItem value="orange">Orange</ListboxItem>
            <ListboxItem value="lemon">Lemon</ListboxItem>
          </ListboxGroup>
        </ListboxContent>
      </ListboxRoot>,
    )

    const listbox = screen.getByRole('listbox', { name: 'Choose fruit' })
    const group = screen.getByRole('group', { name: 'Citrus' })
    const selectedOption = getOption('Orange')

    expect(listbox.getAttribute('aria-orientation')).toBe('vertical')
    expect(group.getAttribute('aria-labelledby')).toBeTruthy()
    expect(selectedOption.getAttribute('aria-selected')).toBe('true')
    expect(selectedOption.getAttribute('data-state')).toBe('checked')
  })

  it('moves focus and selection together in a single-select vertical listbox', async () => {
    const user = userEvent.setup()
    const { listbox, onValueChange } = renderSingleListbox()

    await user.click(listbox)

    expect(getActiveOption(listbox).textContent).toBe('Apple')

    await user.keyboard('{ArrowDown}')

    expect(getActiveOption(listbox).textContent).toBe('Banana')
    expect(getOption('Banana').getAttribute('aria-selected')).toBe('true')
    expect(getOption('Apple').getAttribute('aria-selected')).toBe('false')

    await user.keyboard('{End}')

    expect(getActiveOption(listbox).textContent).toBe('Cherry')
    expect(getOption('Cherry').getAttribute('aria-selected')).toBe('true')

    await user.keyboard('{ArrowDown}')

    expect(getActiveOption(listbox).textContent).toBe('Apple')
    expect(getOption('Apple').getAttribute('aria-selected')).toBe('true')
    expect(onValueChange).toHaveBeenLastCalledWith('apple')
  })

  it('selects the first enabled option when an empty single-select listbox receives focus', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(
      <ListboxRoot onValueChange={onValueChange}>
        <ListboxLabel>Choose fruit</ListboxLabel>
        <ListboxContent>
          <ListboxItem value="apple">Apple</ListboxItem>
          <ListboxItem value="banana">Banana</ListboxItem>
        </ListboxContent>
      </ListboxRoot>,
    )

    const listbox = screen.getByRole('listbox', { name: 'Choose fruit' })

    await user.click(listbox)

    expect(getActiveOption(listbox).textContent).toBe('Apple')
    expect(getOption('Apple').getAttribute('aria-selected')).toBe('true')
    expect(onValueChange).toHaveBeenCalledWith('apple')
  })

  it('keeps DOM focus on the listbox when an option is clicked', async () => {
    const user = userEvent.setup()
    const { listbox } = renderSingleListbox()

    await user.click(getOption('Banana'))

    expect(document.activeElement).toBe(listbox)
    expect(getOption('Banana').getAttribute('aria-selected')).toBe('true')
  })

  it('maps horizontal listbox navigation to both horizontal and vertical arrow keys', async () => {
    const user = userEvent.setup()

    render(
      <ListboxRoot defaultValue="one" orientation="horizontal">
        <ListboxLabel>Choose number</ListboxLabel>
        <ListboxContent>
          <ListboxItem value="one">One</ListboxItem>
          <ListboxItem value="two">Two</ListboxItem>
          <ListboxItem value="three">Three</ListboxItem>
        </ListboxContent>
      </ListboxRoot>,
    )

    const listbox = screen.getByRole('listbox', { name: 'Choose number' })

    await user.click(listbox)
    await user.keyboard('{ArrowDown}')

    expect(getActiveOption(listbox).textContent).toBe('Two')

    await user.keyboard('{ArrowUp}')

    expect(getActiveOption(listbox).textContent).toBe('One')

    await user.keyboard('{ArrowRight}')

    expect(getActiveOption(listbox).textContent).toBe('Two')
  })

  it('supports typeahead with a buffered search string', async () => {
    const user = userEvent.setup()
    const { listbox } = renderSingleListbox()

    await user.click(listbox)
    await user.keyboard('b')

    expect(getActiveOption(listbox).textContent).toBe('Banana')
    expect(getOption('Banana').getAttribute('aria-selected')).toBe('true')

    await user.keyboard('l')

    expect(getActiveOption(listbox).textContent).toBe('Blueberry')
    expect(getOption('Blueberry').getAttribute('aria-selected')).toBe('true')
  })

  it('uses textValue for typeahead when option children are not the search text', async () => {
    const user = userEvent.setup()

    render(
      <ListboxRoot defaultValue="ops">
        <ListboxLabel>Choose team</ListboxLabel>
        <ListboxContent>
          <ListboxItem value="ops">Operations</ListboxItem>
          <ListboxItem value="ml" textValue="Machine Learning">
            ML
          </ListboxItem>
        </ListboxContent>
      </ListboxRoot>,
    )

    const listbox = screen.getByRole('listbox', { name: 'Choose team' })

    await user.click(listbox)
    await user.keyboard('ma')

    expect(getActiveOption(listbox).textContent).toBe('ML')
    expect(getOption('ML').getAttribute('aria-selected')).toBe('true')
  })

  it('keeps multi-select navigation separate from selection and selects all enabled options', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(
      <ListboxRoot multiple defaultValue={['apple']} onValueChange={onValueChange}>
        <ListboxLabel>Choose fruits</ListboxLabel>
        <ListboxContent>
          {fruitOptions.map(option => (
            <ListboxItem key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </ListboxItem>
          ))}
        </ListboxContent>
      </ListboxRoot>,
    )

    const listbox = screen.getByRole('listbox', { name: 'Choose fruits' })

    await user.click(listbox)
    await user.keyboard('{ArrowDown}')

    expect(getActiveOption(listbox).textContent).toBe('Banana')
    expect(getOption('Apple').getAttribute('aria-selected')).toBe('true')
    expect(getOption('Banana').getAttribute('aria-selected')).toBe('false')

    await user.keyboard(' ')

    expect(getOption('Apple').getAttribute('aria-selected')).toBe('true')
    expect(getOption('Banana').getAttribute('aria-selected')).toBe('true')

    await user.keyboard('{Control>}a{/Control}')

    expect(onValueChange).toHaveBeenLastCalledWith(['apple', 'banana', 'blueberry', 'cherry'])
    expect(getOption('Lime').getAttribute('aria-selected')).toBe('false')
  })

  it('allows read-only listboxes to move focus without changing selection', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(
      <ListboxRoot readOnly defaultValue="apple" onValueChange={onValueChange}>
        <ListboxLabel>Read-only fruits</ListboxLabel>
        <ListboxContent>
          <ListboxItem value="apple">Apple</ListboxItem>
          <ListboxItem value="banana">Banana</ListboxItem>
        </ListboxContent>
      </ListboxRoot>,
    )

    const listbox = screen.getByRole('listbox', { name: 'Read-only fruits' })

    await user.click(listbox)
    await user.keyboard('{ArrowDown}')
    await user.keyboard(' ')

    expect(getActiveOption(listbox).textContent).toBe('Banana')
    expect(getOption('Apple').getAttribute('aria-selected')).toBe('true')
    expect(getOption('Banana').getAttribute('aria-selected')).toBe('false')
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('supports external labelling when no ListboxLabel is rendered', () => {
    render(
      <>
        <p id="external-team-label">External team label</p>
        <ListboxRoot defaultValue="design">
          <ListboxContent aria-labelledby="external-team-label">
            <ListboxItem value="design">Design</ListboxItem>
            <ListboxItem value="engineering">Engineering</ListboxItem>
          </ListboxContent>
        </ListboxRoot>
      </>,
    )

    expect(screen.getByRole('listbox', { name: 'External team label' })).toBeTruthy()
  })
})
