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
