import { useEffect, useState } from "react"

export default function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function useDebounceCallback<T>(
  value: T,
  delay: number,
  callback: (value: T) => void,
) {
  const debouncedValue = useDebounce(value, delay)

  useEffect(() => {
    callback(debouncedValue)
  }, [debouncedValue, callback])
}
