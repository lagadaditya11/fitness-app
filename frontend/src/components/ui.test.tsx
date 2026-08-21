import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EmptyState, MacroBar, ProgressRing, Badge } from '../components/ui'

describe('MacroBar', () => {
  it('renders macro labels with gram values', () => {
    render(<MacroBar protein={100} carbs={200} fat={50} />)
    expect(screen.getByText('protein')).toBeInTheDocument()
    expect(screen.getByText('carbs')).toBeInTheDocument()
    expect(screen.getByText('fat')).toBeInTheDocument()
    expect(screen.getByText('100g')).toBeInTheDocument()
    expect(screen.getByText('200g')).toBeInTheDocument()
    expect(screen.getByText('50g')).toBeInTheDocument()
  })

  it('does not divide by zero when all macros are zero', () => {
    render(<MacroBar protein={0} carbs={0} fat={0} />)
    expect(screen.getByText('protein')).toBeInTheDocument()
  })
})

describe('ProgressRing', () => {
  it('shows the percentage label', () => {
    render(<ProgressRing value={500} max={2000} label="25%" sub="500 / 2,000 kcal" />)
    expect(screen.getByText('25%')).toBeInTheDocument()
    expect(screen.getByText('500 / 2,000 kcal')).toBeInTheDocument()
  })
})

describe('EmptyState', () => {
  it('renders title, description and action', () => {
    render(
      <EmptyState title="Nothing here" description="Log something first" action={<button>Go</button>} />
    )
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
    expect(screen.getByText('Log something first'))
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument()
  })
})

describe('Badge', () => {
  it('renders its children', () => {
    render(<Badge color="brand">42 kcal</Badge>)
    expect(screen.getByText('42 kcal')).toBeInTheDocument()
  })
})
