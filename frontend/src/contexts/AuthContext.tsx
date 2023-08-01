import { createContext, useContext, useEffect, useState } from "react"
import { auth } from "@/firebase/firebase"
import {
  GithubAuthProvider,
  User,
  UserCredential,
  signInWithPopup,
} from "firebase/auth"

interface ContextValue {
  currentUser: User | null | undefined
  signin?: () => Promise<UserCredential>
}

const AuthContext = createContext<ContextValue>({
  currentUser: null,
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [currentUser, setCurrentUser] = useState<User | null>()

  const signin = () => {
    const provider = new GithubAuthProvider()
    return signInWithPopup(auth, provider)
  }

  useEffect(() => {
    return auth.onAuthStateChanged((user) => setCurrentUser(user))
  }, [])

  const value: ContextValue = {
    currentUser,
    signin,
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
