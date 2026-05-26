import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LocalCard } from '@/components/LocalCard'
import type { LocalProfile, User } from '@prisma/client'

// Minimal fixture — only the fields LocalCard actually reads
function makeLocal(overrides: Partial<LocalProfile & { user: Pick<User, 'id' | 'name' | 'image'>; rating?: number | null }> = {}) {
  return {
    id: 'local-1',
    userId: 'user-1',
    city: 'bay-area',
    neighborhood: null,
    photoUrl: null,
    tagline: 'Your SF guide',
    bio: '',
    ratePerHour: 5000,       // cents
    yearsInCity: 3,
    residency: 'seasoned' as const,
    status: 'active' as const,
    idVerified: false,
    isFounding: false,
    payoutsEnabled: false,
    bgChecked: false,
    stripeAccountId: null,
    stripeIdentityVerificationId: null,
    dateOfBirth: null,
    governmentIdUrl: null,
    selfieUrl: null,
    instagramHandle: null,
    linkedinUrl: null,
    facebookUrl: null,
    twitterHandle: null,
    snapchatHandle: null,
    lumaUrl: null,
    websiteUrl: null,
    responseRate: null,
    responseTimeMinutes: null,
    yearsHosting: null,
    experienceHeadline: null,
    experienceBlurb: null,
    careerHighlight: null,
    education: null,
    rating: null,
    reviewCount: 0,
    languages: ['EN'],
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
    user: {
      id: 'user-1',
      name: 'Maria Lopez',
      image: null,
      ...(overrides as { user?: Partial<Pick<User, 'id' | 'name' | 'image'>> }).user,
    },
  }
}

describe('LocalCard', () => {
  it('renders the local name and city', () => {
    render(<LocalCard local={makeLocal()} />)
    expect(screen.getByText('Maria Lopez')).toBeInTheDocument()
    // city slug 'bay-area' is in CITIES list and maps to "San Francisco"
    expect(screen.getByText(/San Francisco/i)).toBeInTheDocument()
  })

  it('renders the formatted rate per hour', () => {
    render(<LocalCard local={makeLocal({ ratePerHour: 7500 })} />)
    // formatPrice(7500) → "$75"
    expect(screen.getByText(/\$75/)).toBeInTheDocument()
  })

  it('wraps the card in a link to the local profile', () => {
    render(<LocalCard local={makeLocal()} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/local/local-1')
  })

  it('shows id-verified badge when idVerified is true', () => {
    render(<LocalCard local={makeLocal({ idVerified: true })} />)
    expect(screen.getByTitle('ID verified')).toBeInTheDocument()
  })

  it('hides id-verified badge when idVerified is false', () => {
    render(<LocalCard local={makeLocal({ idVerified: false })} />)
    expect(screen.queryByTitle('ID verified')).not.toBeInTheDocument()
  })

  it('appends ?when= to the link when whenParam is provided', () => {
    render(<LocalCard local={makeLocal()} whenParam="2026-07-15" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/local/local-1?when=2026-07-15')
  })
})
