import { signOut } from "firebase/auth"
import { useState } from "react"

import { useAuth } from "@/contexts/AuthContext"
import { auth } from "@/firebase/firebase"

export default function Signin() {
  const { user } = useAuth()

  const [token, setToken] = useState("")
  console.log("requesting token...")
  user!.getIdToken().then((token) => {
    console.log("got token:", token)
    setToken(token)
  })

  return (
    <>
      <li>Hello, {user!.displayName}</li>
      <li>{user!.email}</li>
      {token && (
        <textarea className="w-full bg-slate-800 text-slate-200">
          {token}
        </textarea>
      )}
      <button onClick={() => signOut(auth)}>Sign out</button>
    </>
  )
}
