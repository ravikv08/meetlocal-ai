import { describe, it, expect, vi } from 'vitest'
import { NextResponse } from 'next/server'

vi.mock('@/auth', () => ({ auth: vi.fn() }))

const { handleError } = await import('@/lib/api/respond')

// NextResponse.json returns a Response; pull the body out for assertions.
async function body(res: Response) {
  return { status: res.status, json: await res.json() }
}

describe('handleError', () => {
  it('maps ApiError to its declared status/code, with issues when present', async () => {
    const { ApiError } = await import('@/lib/api/respond')
    const err = new ApiError(422, 'validation failed', 'validation_error', [
      { code: 'too_small', path: ['hours'], message: 'too small' } as never,
    ])
    const res = handleError(err)
    const b = await body(res)
    expect(b.status).toBe(422)
    expect(b.json).toEqual({
      error: {
        message: 'validation failed',
        code: 'validation_error',
        issues: [{ code: 'too_small', path: ['hours'], message: 'too small' }],
      },
    })
  })

  it('maps "unauthorized" to 401', async () => {
    const res = handleError(new Error('unauthorized'))
    const b = await body(res)
    expect(b.status).toBe(401)
    expect(b.json.error.code).toBe('unauthorized')
  })

  it('maps "forbidden" to 403', async () => {
    const res = handleError(new Error('forbidden'))
    const b = await body(res)
    expect(b.status).toBe(403)
    expect(b.json.error.code).toBe('forbidden')
  })

  it.each([
    ['booking not found', 404],
    ['Local not available', 404],
  ])('maps %j to %i not_found', async (msg, status) => {
    const res = handleError(new Error(msg))
    const b = await body(res)
    expect(b.status).toBe(status)
    expect(b.json.error.code).toBe('not_found')
    // Known sentinel messages are passed through to the client.
    expect(b.json.error.message).toBe(msg)
  })

  it('maps "already has" to 409 conflict', async () => {
    const res = handleError(new Error('Traveler already has a pending booking'))
    const b = await body(res)
    expect(b.status).toBe(409)
    expect(b.json.error.code).toBe('conflict')
  })

  it('maps concurrency-race "no longer available" to 409 conflict', async () => {
    const res = handleError(new Error('Booking no longer available to accept'))
    const b = await body(res)
    expect(b.status).toBe(409)
    expect(b.json.error.code).toBe('conflict')
  })

  it.each([
    ['cannot complete a booking that is cancelled'],
    ['invalid slot format'],
  ])('maps %j to 400 bad_request', async (msg) => {
    const res = handleError(new Error(msg))
    const b = await body(res)
    expect(b.status).toBe(400)
    expect(b.json.error.code).toBe('bad_request')
  })

  it('masks unknown internal errors as a generic 500 and logs server-side', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      const internal = new Error('P2002: Unique constraint failed on `User.email`')
      const res = handleError(internal)
      const b = await body(res)
      expect(b.status).toBe(500)
      expect(b.json.error).toEqual({ message: 'server error', code: 'server_error' })
      // Raw internals must NOT reach the client...
      expect(JSON.stringify(b.json)).not.toContain('Unique constraint')
      // ...but are logged for operators.
      expect(consoleSpy).toHaveBeenCalledWith('[api] unhandled error:', internal)
    } finally {
      consoleSpy.mockRestore()
    }
  })

  it('handles non-Error thrown values with a generic 500', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      const res = handleError('random string throw')
      const b = await body(res)
      expect(b.status).toBe(500)
      expect(b.json.error).toEqual({ message: 'unknown error', code: 'server_error' })
    } finally {
      consoleSpy.mockRestore()
    }
  })
})

// Silence unused-import lint if tree-shaken in some config variant.
void NextResponse
