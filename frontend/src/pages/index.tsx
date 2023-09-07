"use client"

import { Input, Page, useInput } from "@geist-ui/core"
import Head from "next/head"
import { useMemo, useState } from "react"
import { BsSearch } from "react-icons/bs"
import { BarLoader } from "react-spinners"

import { Action, Project } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import ActionCardLarge from "@/components/action/cards/ActionCardLarge"
import ActionPeekModal from "@/components/action/modals/ActionItemPeek"
import MeetingCardLarge from "@/components/meeting/cards/MeetingCardLarge"
import ResolveUserName from "@/components/resolve/ResolveUserName"
import BadgeHeader from "@/components/ui/BadgeHeader"
import Hr from "@/components/ui/Hr"
import ModalPopup from "@/components/ui/modal/ModalPopup"
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

function DashboardProjectItemActions({
  project,
  filter,
  onActionClick,
}: {
  project: Project
  filter: string
  onActionClick: (action: Action) => void
}) {
  const [showActions, setShowActions] = useState(false)

  const { actions } = useAuth()
  const actionListQuery = actions!.useListForMe(project.ID, true)
  if (actionListQuery.isLoading) {
    return <BarLoader />
  }
  if (actionListQuery.isError) {
    return (
      <>Error loading actions: {extractErrorMessage(actionListQuery.error)}</>
    )
  }
  const hasActions = actionListQuery.data.data.length > 0
  const filteredActions = actionListQuery.data.data.filter(
    (action) =>
      !filter ||
      action.title.toLowerCase().includes(filter.toLowerCase()) ||
      action.description.toLowerCase().includes(filter.toLowerCase()),
  )
  if (filteredActions.length === 0) {
    return undefined
  }
  return (
    <>
      <BadgeHeader title={project.name} badge={filteredActions.length} />
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredActions.map((action) => (
          <ActionCardLarge
            key={action.ID}
            onClick={() => onActionClick(action)}
            action={action}
          />
        ))}
      </div>
    </>
  )
}

function ProjectList() {
  const { state: search, bindings: searchBindings } = useInput("")

  const [showActionPeek, setShowActionPeek] = useState(false)
  const [actionPeekItem, setActionPeekItem] = useState<Action | null>(null)

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
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Actions Assigned to You</h1>
      <Input
        icon={<BsSearch />}
        placeholder="Search in Actions..."
        width="100%"
        {...searchBindings}
      />

      {/* Quick Peek Action */}
      <ModalPopup
        open={showActionPeek && !!actionPeekItem}
        setOpen={setShowActionPeek}
      >
        <ActionPeekModal
          action={actionPeekItem!}
          onClose={() => {
            setShowActionPeek(false)
          }}
        />
      </ModalPopup>

      <div className="flex w-full flex-col space-y-2">
        {projects.map((project) => (
          <DashboardProjectItemActions
            key={project.ID}
            project={project}
            onActionClick={(action) => {
              setActionPeekItem(action)
              setShowActionPeek(true)
            }}
            filter={search}
          />
        ))}
      </div>
    </section>
  )
}

function DashboardMeeting() {
  const { state: search, bindings: searchBindings } = useInput("")

  const { meetings } = useAuth()
  const upcomingMeetingsQuery = meetings!.useListUpcoming()
  if (upcomingMeetingsQuery.isLoading) {
    return <BarLoader />
  }
  if (upcomingMeetingsQuery.isError) {
    return (
      <>
        Error loading upcoming meetings:{" "}
        {extractErrorMessage(upcomingMeetingsQuery.error)}
      </>
    )
  }
  const upcomingMeetings = upcomingMeetingsQuery.data.data
  if (!upcomingMeetings?.length) {
    return <>No upcoming meetings</>
  }
  return (
    <section className="space-y-4">
      <div className="flex items-center space-x-4">
        <BadgeHeader
          title="Upcoming Meetings"
          className="text-2xl font-semibold"
          badge={upcomingMeetings.length}
        />
      </div>
      <Input
        icon={<BsSearch />}
        placeholder="Search in Upcoming Meetings..."
        width="100%"
        {...searchBindings}
      />
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {upcomingMeetings
          .filter(
            (meeting) =>
              !search ||
              meeting.name.toLowerCase().includes(search.toLowerCase()),
          )
          .map((meeting) => (
            <MeetingCardLarge key={meeting.ID} meeting={meeting} />
          ))}
      </div>
    </section>
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
    <Page>
      <Head>
        <title>Perplex - Dashboard</title>
      </Head>
      <div>
        <h1 className="text-5xl text-neutral-400">
          {greeting}
          <span className="font-bold text-white">
            <ResolveUserName userID={user!.uid} />
          </span>
          !
        </h1>
        <Hr className="my-8" />
      </div>
      <div className="h-full max-h-full">
        <DashboardMeeting />
        <Hr className="my-4" />
        <ProjectList />
      </div>
    </Page>
  )
}
