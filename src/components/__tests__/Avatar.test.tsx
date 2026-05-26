import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Avatar } from '@/components/Avatar'

describe('Avatar', () => {
  it('renders an img when imageUrl is provided', () => {
    render(<Avatar name="Sam Chen" imageUrl="https://example.com/sam.jpg" />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://example.com/sam.jpg')
    expect(img).toHaveAttribute('alt', 'Sam Chen')
  })

  it('renders initials fallback when no imageUrl is provided', () => {
    render(<Avatar name="Sam Chen" />)
    // initialsFrom("Sam Chen") → "SC"
    expect(screen.getByText('SC')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('renders single initial for a single-word name', () => {
    render(<Avatar name="Cher" />)
    expect(screen.getByText('C')).toBeInTheDocument()
  })

  it('applies the size prop as inline width/height on the img', () => {
    render(<Avatar name="Sam Chen" imageUrl="https://example.com/sam.jpg" size={64} />)
    const img = screen.getByRole('img')
    // jsdom serialises numeric style values with a px unit
    expect(img).toHaveStyle({ width: '64px', height: '64px' })
  })

  it('applies the size prop as inline width/height on the initials div', () => {
    render(<Avatar name="Sam Chen" size={80} />)
    const div = screen.getByText('SC').closest('div')
    // jsdom serialises numeric style values with a px unit
    expect(div).toHaveStyle({ width: '80px', height: '80px' })
  })
})
