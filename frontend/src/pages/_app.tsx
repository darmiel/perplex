import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import type { Metadata } from "next"
import { AppProps } from "next/app"
import { Inter } from "next/font/google"
import Head from "next/head"
import { useEffect } from "react"

import Navbar from "@/components/navbar/Navbar"
import { AuthProvider } from "@/contexts/AuthContext"

import "./globals.css"

import { ToastContainer } from "react-toastify"

import "react-toastify/dist/ReactToastify.css"

const inter = Inter({ subsets: ["latin"] })

const queryClient = new QueryClient()

export const metadata: Metadata = {
  title: "Daniels Meeting Planner",
  description: "Plan Meetings Yes!",
}

export default function RootLayout({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Add the custom class to the <body> element
    document.body.classList.add(inter.className)

    // Clean up the class when the component unmounts
    return () => {
      document.body.classList.remove(inter.className)
    }
  }, [])
  return (
    <>
      <Head>
        <meta content="width=device-width, initial-scale=1" name="viewport" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <div className="flex">
            <Navbar />
            <Component {...pageProps} />
          </div>
          <ToastContainer position="bottom-right" />
          <ReactQueryDevtools />
        </AuthProvider>
      </QueryClientProvider>
    </>
  )
}
