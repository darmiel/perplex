import { auth } from "@/firebase/firebase"
import { User } from "firebase/auth"

export const url = "http://localhost:8080/"

export function buildUrl(paths: any[]) {
  return url + paths.map((v) => String(v)).join("/")
}

export interface BackendResponse {
  success: boolean
  error: string
  message: string
  data: unknown
}

export async function authFetch(
  token: string,
  url: string,
  init?: RequestInit
): Promise<BackendResponse> {
  const requestHeaders: HeadersInit = new Headers()
  requestHeaders.set("Authorization", `Bearer ${token}`)
  requestHeaders.set("Content-Type", "application/json")

  const resp = await fetch(url, {
    ...init,
    headers: requestHeaders,
  })
  return (await resp.json()) as BackendResponse
}
