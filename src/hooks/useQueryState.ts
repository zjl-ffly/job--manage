import React from 'react'

function readSearchParams(): URLSearchParams {
  return new URLSearchParams(window.location.search)
}

function writeSearchParams(params: URLSearchParams, { replace }: { replace?: boolean } = {}) {
  const next = params.toString()
  const nextUrl = `${window.location.pathname}${next ? `?${next}` : ''}${window.location.hash ?? ''}`
  if (replace) {
    window.history.replaceState({}, '', nextUrl)
  } else {
    window.history.pushState({}, '', nextUrl)
  }
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function useQueryState<T>(
  key: string,
  opts: {
    defaultValue: T
    parse: (raw: string | null) => T
    serialize: (value: T) => string | null
    replace?: boolean
  }
): [T, (next: T) => void] {
  const { defaultValue, parse, serialize, replace } = opts
  const [value, setValue] = React.useState<T>(() => parse(readSearchParams().get(key)) ?? defaultValue)

  React.useEffect(() => {
    const onPop = () => {
      const raw = readSearchParams().get(key)
      const next = parse(raw)
      setValue(next ?? defaultValue)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [key, parse, defaultValue])

  const setQueryValue = React.useCallback(
    (next: T) => {
      const params = readSearchParams()
      const raw = serialize(next)
      if (raw == null || raw === '') params.delete(key)
      else params.set(key, raw)
      writeSearchParams(params, { replace })
    },
    [key, replace, serialize]
  )

  return [value, setQueryValue]
}

