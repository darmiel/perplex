import { AxiosError } from "axios"
import { forwardRef } from "react"
import { toast } from "sonner"

import { BackendResponse } from "@/api/types"

import "react-datepicker/dist/react-datepicker.css"

export function extractErrorMessage(error: unknown): string {
  if (
    error instanceof AxiosError ||
    (typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof error.response === "object" &&
      error.response !== null &&
      "data" in error.response &&
      typeof error.response.data === "object" &&
      error.response.data !== null)
  ) {
    const response = error?.response as { data: BackendResponse }
    return response?.data?.error ?? "unknown error"
  }
  if (typeof error === "string") {
    return error
  }
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === "object" && error !== null) {
    if ("message" in error && typeof error.message === "string") {
      return error.message
    }
  }
  return JSON.stringify(error)
}

export function toastError<Variables>(
  message: string | ((variables: Variables) => string),
) {
  return (err: AxiosError, variables: Variables) => {
    const title = typeof message === "string" ? message : message(variables)
    const body = extractErrorMessage(err)

    toast.error(title, { description: body })
  }
}

export function includesFold(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase())
}

interface PickerCustomInputProps {
  value?: string
  onClick?: () => void
}

export const PickerCustomInput = forwardRef<
  HTMLButtonElement,
  PickerCustomInputProps
>(({ value, onClick }, ref) => (
  <button
    className="w-full rounded-lg border border-neutral-600 bg-neutral-800 p-2"
    onClick={onClick}
    ref={ref}
  >
    {value || "Select Date"}
  </button>
))

PickerCustomInput.displayName = "PickerCustomInput"
