import "./globals.css"
import type { Metadata } from "next"
import { AppProps } from "next/app"
import { Inter } from "next/font/google"
import Head from "next/head"
import { useEffect } from "react"

const inter = Inter({ subsets: ["latin"] })

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
      <Component {...pageProps} />
    </>
  )
}
