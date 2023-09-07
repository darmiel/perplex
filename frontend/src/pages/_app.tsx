import { GeistProvider } from "@geist-ui/core"
import { NextUIProvider } from "@nextui-org/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import type { Metadata } from "next"
import { AppProps } from "next/app"
import { Inter } from "next/font/google"
import Head from "next/head"
import { useEffect, useState } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { Toaster } from "sonner"

import PerplexLogo from "@/../public/perplex.svg"
import { AuthProvider } from "@/contexts/AuthContext"

import "./globals.css"

import Navbar from "@/components/navbar/Navbar"
import SearchModal from "@/components/search/SearchModal"
import ModalPopup from "@/components/ui/modal/ModalPopup"

const inter = Inter({ subsets: ["latin"] })

const queryClient = new QueryClient()

export const metadata: Metadata = {
  title: "Daniels Meeting Planner",
  description: "Plan Meetings Yes!",
}

export default function RootLayout({ Component, pageProps }: AppProps) {
  const [showSearch, setShowSearch] = useState(false)

  useHotkeys(
    "mod+k",
    () => {
      setShowSearch(true)
    },
    [showSearch],
  )

  useEffect(() => {
    // Add the custom class to the <body> element
    document.body.classList.add(inter.className)

    // Clean up the class when the component unmounts
    return () => {
      document.body.classList.remove(inter.className)
    }
  }, [])

  return (
    <NextUIProvider>
      <Head>
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <link href={PerplexLogo.src} rel="icon" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <GeistProvider themeType="dark">
          {/* <CssBaseline /> */}
          <AuthProvider>
            <div className="flex h-screen max-h-screen w-screen">
              <Navbar />

              <ModalPopup open={showSearch} setOpen={setShowSearch}>
                <SearchModal onClose={() => setShowSearch(false)} />
              </ModalPopup>

              {/*<Register>*/}
              <main className="bg-darker dark flex flex-1 overflow-y-auto">
                <Component {...pageProps} />
              </main>

              {/*</Register>*/}
            </div>
            <Toaster theme="dark" closeButton={true} position="bottom-right" />
            <ReactQueryDevtools position="bottom-right" />
          </AuthProvider>
        </GeistProvider>
      </QueryClientProvider>
    </NextUIProvider>
  )
}
