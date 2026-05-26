import '@testing-library/jest-dom'
import { vi, beforeEach } from 'vitest'
import React from 'react'

// Clear all mocks between tests so state doesn't bleed across
beforeEach(() => vi.clearAllMocks())

// ── Next.js navigation ────────────────────────────────────────────────────
vi.mock('next/navigation', () => ({
  useRouter: vi.fn().mockReturnValue({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: vi.fn().mockReturnValue('/'),
  // Cast to ReadonlyURLSearchParams — App Router's actual return type
  useSearchParams: vi.fn().mockReturnValue(new URLSearchParams() as ReturnType<typeof import('next/navigation').useSearchParams>),
}))

// next/link — render as plain <a> (no router context needed)
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string
    children: React.ReactNode
    [key: string]: unknown
  }) => React.createElement('a', { href, ...rest }, children),
}))

// next/image — render as plain <img>
vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    ...rest
  }: {
    src: string
    alt: string
    [key: string]: unknown
  }) => React.createElement('img', { src, alt, ...rest }),
}))

// ── Browser APIs not in jsdom ────────────────────────────────────────────
// react-aria-components uses `new ResizeObserver(cb)` — must be a class, not a factory fn
class ResizeObserverStub {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
global.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver

// react-aria-components uses matchMedia for responsive popover placement
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
