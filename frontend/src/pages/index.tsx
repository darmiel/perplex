"use client"

import { motion } from "framer-motion"
import Head from "next/head"
import { useMemo } from "react"
import { Tooltip } from "react-tooltip"

import { getRandomGreeting } from "@/compat/language"
import ActionGrid from "@/components/action/sections/ActionGrid"
import { MeetingGrid } from "@/components/meeting/sections/MeetingGrid"
import ResolveUserName from "@/components/resolve/ResolveUserName"
import Hr from "@/components/ui/Hr"
import Page from "@/components/ui/layout/Page"
import { useAuth } from "@/contexts/AuthContext"

export default function Home() {
  const [greetingLanguage, greeting] = useMemo(() => getRandomGreeting(), [])
  const { user } = useAuth()

  if (!user) {
    return <>Not logged in</>
  }

  return (
    <Page>
      <Head>
        <title>Perplex - Dashboard</title>
      </Head>
      <motion.div
        animate={{
          x: 25,
        }}
        className="-translate-x-[25px]"
      >
        <h1 className="flex items-center space-x-2 text-5xl text-neutral-400">
          <span
            data-tooltip-id="greeting-language-tooltip"
            data-tooltip-content={greetingLanguage}
            data-tooltip-place="bottom"
            data-tooltip-variant="dark"
            className="cursor-help"
          >
            {greeting},
          </span>
          <span>
            <span className="font-bold text-white">
              <ResolveUserName userID={user!.uid} />
            </span>
            <span>!</span>
          </span>
          <Tooltip
            id="greeting-language-tooltip"
            style={{
              backgroundColor: "black",
              color: "blueviolet",
            }}
          />
        </h1>
      </motion.div>
      <Hr className="my-8" />
      <div className="h-fit min-h-full">
        <MeetingGrid upcomingOnly />
        <Hr className="my-4" />
        <ActionGrid />
      </div>
    </Page>
  )
}
