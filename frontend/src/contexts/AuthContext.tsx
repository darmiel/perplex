import { useQueryClient } from "@tanstack/react-query"
import axiosDefault, { Axios } from "axios"
import {
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from "firebase/auth"
import { createContext, useContext, useEffect, useState } from "react"
import { BsGithub, BsGoogle } from "react-icons/bs"

import { functions } from "@/api/functions"
import { auth } from "@/firebase/firebase"

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

  const signinGitHub = () => {
    const provider = new GithubAuthProvider()
    return signInWithPopup(auth, provider)
  }

  const signinGoogle = () => {
    const provider = new GoogleAuthProvider()
    return signInWithPopup(auth, provider)
  }

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
    <div className="bg-red-600 p-4 text-white">
      You are not signed in.
      <button
        type="button"
        className="mb-2 mr-2 inline-flex items-center rounded-lg bg-[#24292F] px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-[#24292F]/90 focus:outline-none focus:ring-4 focus:ring-[#24292F]/50 dark:hover:bg-[#050708]/30 dark:focus:ring-gray-500"
        onClick={() => signinGitHub()}
      >
        <BsGithub />
        Sign in with GitHub
      </button>
      <button
        type="button"
        className="mb-2 mr-2 inline-flex items-center rounded-lg bg-[#24292F] px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-[#24292F]/90 focus:outline-none focus:ring-4 focus:ring-[#24292F]/50 dark:hover:bg-[#050708]/30 dark:focus:ring-gray-500"
        onClick={() => signinGoogle()}
      >
        <BsGoogle />
        Sign in with Google
      </button>
    </div>
  )
}
