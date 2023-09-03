import { AxiosError } from "axios"
import { toast } from "sonner"

import { BackendResponse } from "@/api/types"

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
