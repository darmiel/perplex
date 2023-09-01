"use client"

import Head from "next/head"
import Link from "next/link"
import { useMemo, useState } from "react"
import { BsGear, BsPersonWorkspace } from "react-icons/bs"
import { BarLoader } from "react-spinners"

import { extractErrorMessage } from "@/api/util"
import ProjectModalManageProjects from "@/components/project/modals/ProjectModalManageProjects"
import BadgeHeader from "@/components/ui/BadgeHeader"
import Button from "@/components/ui/Button"
import Hr from "@/components/ui/Hr"
import ModalPopup from "@/components/ui/modal/ModalPopup"
import TagList from "@/components/ui/tag/TagList"
import ResolveUserName from "@/components/user/ResolveUserName"
import UserAvatar from "@/components/user/UserAvatar"
import { useAuth } from "@/contexts/AuthContext"

const greetings = [
  "Hello, ", // English
  "Hola, ", // Spanish
  "Bonjour, ", // French
  "Ciao, ", // Italian
  "Hallo, ", // German
  "Konnichiwa, ", // Japanese
  "Namaste, ", // Hindi
  "Salam, ", // Arabic
  "Nǐ hǎo, ", // Chinese (Mandarin)
  "Annyeonghaseyo, ", // Korean
  "Merhaba, ", // Turkish
  "Szia, ", // Hungarian
  "Olá, ", // Portuguese
  "Zdravstvuyte, ", // Russian
  "Guten Tag, ", // German
  "Sawasdee, ", // Thai
  "Salut, ", // Romanian
  "Aloha, ", // Hawaiian
  "Hej, ", // Swedish
  "Shalom, ", // Hebrew
  "Halo, ", // Indonesian
  "Marhaba, ", // Arabic
  "Hoi, ", // Dutch
  "Ahoj, ", // Czech
  "Kamusta, ", // Filipino
  "Hei, ", // Norwegian
  "Salve, ", // Latin
  "Sveiki, ", // Latvian
  "Salamu, ", // Swahili
  "Dia duit, ", // Irish
]

function ProjectList() {
  const [showManageProjects, setShowManageProjects] = useState(false)

  const { projects: projectsDB } = useAuth()
  const projectListQuery = projectsDB!.useList()

  if (projectListQuery.isLoading) {
    return <BarLoader />
  }
  if (projectListQuery.isError) {
    return (
      <>Error loading projects: {extractErrorMessage(projectListQuery.error)}</>
    )
  }
  const projects = projectListQuery.data.data
  return (
    <>
      <ModalPopup open={showManageProjects} setOpen={setShowManageProjects}>
        <ProjectModalManageProjects
          onClose={() => setShowManageProjects(false)}
        />
      </ModalPopup>
      <div className="flex items-center space-x-4">
        <BadgeHeader title="Projects" badge={projects.length} />
        <Button
          style="secondary"
          onClick={() => setShowManageProjects(true)}
          icon={<BsGear />}
        >
          Manage Projects
        </Button>
      </div>
      <TagList>
        {projects.map((project) => (
          <Link href={`/project/${project.ID}`} key={project.ID}>
            <div className="flex items-center space-x-4 px-6 py-4 rounded-md border border-neutral-700 hover:bg-neutral-950">
              <UserAvatar userID={String(project.ID)} />
              <div className="flex flex-col space-y-0">
                <h2 className="text-xl font-semibold">{project.name}</h2>
                <p className="space-x-1">
                  <span className="text-neutral-400">Created by</span>
                  <span>
                    <ResolveUserName userID={project.owner_id} />
                  </span>
                </p>
              </div>
            </div>
          </Link>
        ))}
      </TagList>
    </>
  )
}

export default function Home() {
  const greeting = useMemo(
    () => greetings[Math.floor(Math.random() * greetings.length)],
    [],
  )
  const { user } = useAuth()

  if (!user) {
    return <>Not logged in</>
  }

  return (
    <div className="p-20 bg-neutral-900 w-full flex flex-col space-y-6">
      <Head>
        <title>Perplex - Dashboard</title>
      </Head>
      <h1 className="text-5xl text-neutral-400">
        {greeting}
        <span className="text-white font-bold">
          <ResolveUserName userID={user!.uid} />
        </span>
        !
      </h1>
      <Hr />
      <ProjectList />
      <div className="h-full w-full flex justify-center items-center">
        <div className="p-4 border border-orange-500 bg-orange-500 text-orange-500 bg-opacity-10 rounded-md flex space-x-2 items-center">
          <BsPersonWorkspace />
          <span>Extended Dashboard coming soon.</span>
        </div>
      </div>
    </div>
  )
}
