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
  user: User,
  url: string,
  init?: RequestInit
): Promise<BackendResponse> {
  // get token
  const token = await user.getIdToken()

  const resp = await fetch(url, {
    ...init,
    headers: {
      Authorization: "Bearer " + token,
    },
  })
  return (await resp.json()) as BackendResponse
}
