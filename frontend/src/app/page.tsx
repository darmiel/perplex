"use client"
import Signin from "@/components/Signin"
import { AuthProvider } from "@/contexts/AuthContext"

export default function Home() {
  return (
    <AuthProvider>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <Signin />
      </main>
    </AuthProvider>
  )
}
