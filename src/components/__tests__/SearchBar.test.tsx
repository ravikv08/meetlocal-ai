import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from '@/components/SearchBar'
import { useRouter } from 'next/navigation'

const CITIES = [
  { slug: 'bay-area', name: 'Bay Area', state: 'CA' },
  { slug: 'miami', name: 'Miami', state: 'FL' },
  { slug: 'tampa', name: 'Tampa', state: 'FL' },
  { slug: 'portland-me', name: 'Portland', state: 'ME' },
]

const VIBES = [
  { id: 'food', label: 'Food scene', blurb: 'Eat like a local' },
  { id: 'art', label: 'Art & culture', blurb: 'Hidden galleries' },
]

function renderSearchBar(overrides: Partial<Parameters<typeof SearchBar>[0]> = {}) {
  return render(
    <SearchBar
      cities={CITIES}
      vibes={VIBES}
      defaultCity={null}
      defaultWhen={null}
      defaultVibes={[]}
      {...overrides}
    />,
  )
}

describe('SearchBar', () => {
  it('renders all city options in the city popover', async () => {
    renderSearchBar()

    // Find the "City" pill and click it to open the popover
    const cityPill = screen.getByText('Pick a city')
    await userEvent.click(cityPill)

    // ListBox options render in the Popover (may be in document.body portal)
    await waitFor(() => {
      expect(screen.getByText('Bay Area')).toBeInTheDocument()
      expect(screen.getByText('Miami')).toBeInTheDocument()
      expect(screen.getByText('Tampa')).toBeInTheDocument()
      expect(screen.getByText('Portland')).toBeInTheDocument()
    })
  })

  it('updates the city pill label after selecting a city', async () => {
    renderSearchBar()

    await userEvent.click(screen.getByText('Pick a city'))
    await waitFor(() => screen.getByText('Bay Area'))
    await userEvent.click(screen.getByText('Bay Area'))

    // The pill label should now show 'Bay Area'
    await waitFor(() => {
      // "Pick a city" should be replaced by "Bay Area"
      expect(screen.queryByText('Pick a city')).not.toBeInTheDocument()
      expect(screen.getAllByText('Bay Area').length).toBeGreaterThan(0)
    })
  })

  it('does not call router.push until all 3 filters are filled', async () => {
    const pushMock = vi.fn()
    vi.mocked(useRouter).mockReturnValue({
      push: pushMock,
      replace: vi.fn(),
      back: vi.fn(),
      prefetch: vi.fn(),
      refresh: vi.fn(),
    })

    renderSearchBar()

    // Click the "Find locals" button without filling any filters
    const findBtn = screen.getByRole('button', { name: /find locals/i })
    await userEvent.click(findBtn)

    expect(pushMock).not.toHaveBeenCalled()
  })
})
