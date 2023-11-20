import { useQueryClient } from "@tanstack/react-query"
import axiosDefault, { Axios } from "axios"
import { User } from "firebase/auth"
import { createContext, useContext, useEffect, useState } from "react"

import { functions } from "@/api/functions"
import { auth } from "@/firebase/firebase"
import LandingPage from "@/pages/landing"

type ContextValue = {
  user?: User
  axios?: Axios
  logout?: () => Promise<void>
} & Partial<ReturnType<typeof functions>>

const AuthContext = createContext<ContextValue>({})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [value, setValue] = useState<ContextValue>()
  const queryClient = useQueryClient()

  const logout = () => {
    queryClient.invalidateQueries()
    return auth.signOut()
  }

  useEffect(() => {
    return auth.onAuthStateChanged((user) => {
      if (user) {
        const axios = axiosDefault.create({
          baseURL: process.env.NEXT_PUBLIC_API_BASE_PATH,
        })
        axios.interceptors.request.use(async (config) => {
          config.headers.Authorization = `Bearer ${await user.getIdToken()}`
          return config
        })
        setValue({
          user,
          axios,
          logout,
          ...functions(axios, queryClient),
        })
      } else {
        setValue(undefined)
      }
    })
  }, [])

  return value ? (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  ) : (
    <LandingPage />
  )
}
