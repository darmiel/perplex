import { Dispatch, SetStateAction, useEffect, useState } from "react"

export function useLocalBoolState(
  path: string,
  defaultValue: boolean = false,
): [boolean, Dispatch<SetStateAction<boolean>>] {
  const [state, setState] = useState((): boolean => {
    return String(localStorage.getItem(path) ?? defaultValue) === "true"
  })
  useEffect(() => {
    localStorage.setItem(path, String(state))
  }, [path, state])
  return [state, setState]
}

export function useLocalState<T>(
  path: string,
  defaultValue: string,
  loads: (value: string) => T,
  dumps: (value: T) => string,
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState((): T => {
    return loads(localStorage.getItem(path) ?? defaultValue)
  })
  useEffect(() => {
    localStorage.setItem(path, dumps(state))
  }, [path, state])
  return [state, setState]
}

export function useLocalStrState(path: string, defaultValue: string) {
  return useLocalState(
    path,
    defaultValue,
    (value) => value,
    (value) => value,
  )
}
