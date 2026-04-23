import {
  mockAllNames,
  mockAllStatuses,
  mockAllTypes,
  mockDeleteJobById,
  mockGetCurrentUser,
  mockGetJobById,
  mockGetJobList,
  mockGetSubContextById,
  mockLogin,
  mockLoginOut
} from './mock'
import type { JobStepKey } from '../domain/types'

type MockRouteResult = { status?: number; body: unknown }

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  })
}

export class ApiError extends Error {
  readonly name = 'ApiError'
  readonly url: string
  readonly method: string
  readonly status: number
  readonly body: unknown

  constructor(args: { url: string; method: string; status: number; body: unknown; message?: string }) {
    super(args.message ?? `Request failed: ${args.method} ${args.url} -> ${args.status}`)
    this.url = args.url
    this.method = args.method
    this.status = args.status
    this.body = args.body
  }
}

function matchMock(url: string, init?: RequestInit): MockRouteResult | null {
  const method = (init?.method ?? 'GET').toUpperCase()
  const u = new URL(url, 'http://local.mock')

  if (method === 'GET' && u.pathname === '/api/user') {
    if (u.searchParams.get('login') === '1') {
      return { body: mockLogin() }
    }
    return { body: mockGetCurrentUser() }
  }

  if (method === 'POST' && u.pathname === '/api/logout') {
    return { body: mockLoginOut() }
  }

  if (method === 'GET' && u.pathname === '/api/filters/names') {
    return { body: mockAllNames }
  }

  if (method === 'GET' && u.pathname === '/api/filters/types') {
    return { body: mockAllTypes }
  }

  if (method === 'GET' && u.pathname === '/api/filters/statuses') {
    return { body: mockAllStatuses }
  }

  if (method === 'GET' && u.pathname === '/api/jobs') {
    return { body: mockGetJobList() }
  }

  if (method === 'DELETE' && u.pathname.startsWith('/api/jobs/')) {
    const jobId = decodeURIComponent(u.pathname.replace('/api/jobs/', ''))
    const ok = mockDeleteJobById(jobId)
    if (!ok) return { status: 404, body: { message: 'Job not found' } }
    return { body: { ok: true } }
  }

  if (method === 'GET' && u.pathname.startsWith('/api/jobs/')) {
    const jobId = decodeURIComponent(u.pathname.replace('/api/jobs/', ''))
    const job = mockGetJobById(jobId)
    if (!job) return { status: 404, body: { message: 'Job not found' } }
    return { body: job }
  }

  if (method === 'GET' && u.pathname.startsWith('/api/subcontext/')) {
    const jobId = decodeURIComponent(u.pathname.replace('/api/subcontext/', ''))
    const step = (u.searchParams.get('step') ?? 'upload') as JobStepKey
    return { body: mockGetSubContextById(jobId, step) }
  }

  return null
}

let installed = false

export function installApiMocks(): void {
  if (installed) return
  installed = true

  const originalFetch = globalThis.fetch?.bind(globalThis)
  if (!originalFetch) return

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
    const hit = matchMock(url, init)
    if (hit) return jsonResponse(hit.body, hit.status)
    return originalFetch(input as any, init)
  }
}

async function readBody(res: Response): Promise<unknown> {
  if (res.status === 204) return null
  const contentType = res.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    try {
      return await res.json()
    } catch {
      return null
    }
  }
  try {
    const text = await res.text()
    return text || null
  } catch {
    return null
  }
}

function toErrorMessage(body: unknown): string | undefined {
  if (!body) return undefined
  if (typeof body === 'string') return body
  if (typeof body === 'object') {
    const msg = (body as any).message
    if (typeof msg === 'string' && msg.trim()) return msg
  }
  return undefined
}

function mergeAbortSignals(a?: AbortSignal, b?: AbortSignal): AbortSignal | undefined {
  if (!a) return b
  if (!b) return a
  if (a.aborted) return a
  if (b.aborted) return b
  const c = new AbortController()
  const onAbort = () => c.abort()
  a.addEventListener('abort', onAbort, { once: true })
  b.addEventListener('abort', onAbort, { once: true })
  return c.signal
}

export async function requestJson<T>(
  url: string,
  init?: RequestInit,
  options?: { timeoutMs?: number; signal?: AbortSignal }
): Promise<T> {
  const method = (init?.method ?? 'GET').toUpperCase()

  let timeoutId: number | undefined
  const timeoutController = new AbortController()
  const timeoutMs = options?.timeoutMs ?? 15000
  if (Number.isFinite(timeoutMs) && timeoutMs > 0) {
    timeoutId = window.setTimeout(() => timeoutController.abort(), timeoutMs)
  }

  const initSignal = init?.signal ?? undefined
  const signal = mergeAbortSignals(initSignal, mergeAbortSignals(options?.signal, timeoutController.signal))

  try {
    const res = await fetch(url, {
      ...init,
      signal,
      headers: {
        Accept: 'application/json',
        ...(init?.headers ?? {})
      }
    })

    const body = await readBody(res)
    if (!res.ok) {
      throw new ApiError({ url, method, status: res.status, body, message: toErrorMessage(body) })
    }
    return body as T
  } catch (e: any) {
    if (e?.name === 'AbortError') {
      throw new ApiError({ url, method, status: 0, body: null, message: `Request aborted: ${method} ${url}` })
    }
    throw e
  } finally {
    if (timeoutId != null) window.clearTimeout(timeoutId)
  }
}

