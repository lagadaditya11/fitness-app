import { afterEach, describe, expect, it, vi } from 'vitest'
import { api, ApiError, clearToken, getToken, setToken } from './api'

function mockFetch(status: number, body: unknown) {
  return vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' }
    })
  )
}

afterEach(() => {
  localStorage.clear()
  vi.unstubAllGlobals()
})

describe('token storage', () => {
  it('stores and clears the token', () => {
    expect(getToken()).toBeNull()
    setToken('abc')
    expect(getToken()).toBe('abc')
    clearToken()
    expect(getToken()).toBeNull()
  })
})

describe('api()', () => {
  it('returns parsed JSON on success', async () => {
    vi.stubGlobal('fetch', mockFetch(200, { hello: 'world' }))
    const data = await api<{ hello: string }>('/api/x')
    expect(data).toEqual({ hello: 'world' })
  })

  it('sends the Authorization header when a token exists', async () => {
    setToken('tok123')
    const fetchMock = mockFetch(200, {})
    vi.stubGlobal('fetch', fetchMock)
    await api('/api/x')
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer tok123')
  })

  it('throws an ApiError with the server message on failure', async () => {
    vi.stubGlobal('fetch', mockFetch(400, { error: 'Email already registered' }))
    await expect(api('/api/x')).rejects.toMatchObject({
      status: 400,
      message: 'Email already registered'
    })
  })

  it('falls back to a generic message for non-JSON errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('oops', { status: 500 }))
    )
    await expect(api('/api/x')).rejects.toMatchObject({ status: 500 })
  })

  it('clears the token and reports network errors distinctly', async () => {
    setToken('tok')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await expect(api('/api/x')).rejects.toThrow('Network error')
    expect(getToken()).toBe('tok') // network errors do not log out
  })
})

describe('ApiError', () => {
  it('is an Error with a status', () => {
    const err = new ApiError(404, 'Not found')
    expect(err).toBeInstanceOf(Error)
    expect(err.status).toBe(404)
    expect(err.message).toBe('Not found')
  })
})
