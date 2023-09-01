"use client"

import Head from "next/head"
import Link from "next/link"
import { Fragment, useMemo, useState } from "react"
import { BsArrowDown, BsArrowRight, BsArrowUp, BsGear } from "react-icons/bs"
import { BarLoader } from "react-spinners"

import { Action, Project } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import ActionListItemSmall from "@/components/action/ActionListItemSmall"
import ActionPeekModal from "@/components/action/modals/ActionItemPeek"
import ProjectModalManageProjects from "@/components/project/modals/ProjectModalManageProjects"
import BadgeHeader from "@/components/ui/BadgeHeader"
import Button from "@/components/ui/Button"
import { RelativeDate } from "@/components/ui/DateString"
import DurationTag from "@/components/ui/DurationTag"
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

function DashboardProjectItemActions({
  project,
  onActionClick,
}: {
  project: Project
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
  return (
    <>
      <div className="flex flex-col space-y-1 px-2 py-2 border-l-4 border-l-primary-600 bg-neutral-950 text-neutral-400">
        <p className="space-x-1">
          {hasActions ? (
            <span className="text-white">
              {actionListQuery.data.data.length}
            </span>
          ) : (
            "No "
          )}
          <span>open Actions assigned to you</span>
        </p>

        {hasActions && (
          <Button
            className="text-xs w-fit"
            onClick={() => setShowActions((old) => !old)}
            icon={showActions ? <BsArrowUp /> : <BsArrowDown />}
          >
            {showActions ? "Hide" : "Show"} Actions
          </Button>
        )}
      </div>
      {showActions && (
        <div className="flex flex-col space-y-4">
          {actionListQuery.data.data.map((action) => (
            <div
              key={action.ID}
              onClick={() => onActionClick(action)}
              className="w-full p-3 flex flex-col space-x-2 space-y-1 bg-neutral-900 hover:bg-neutral-950 border border-neutral-700 rounded-md max-w-sm"
            >
              <ActionListItemSmall action={action} />
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function DashboardProjectItem({
  project,
  onActionClick,
}: {
  project: Project
  onActionClick: (action: Action) => void
}) {
  return (
    <section className="h-full flex flex-col p-4 space-y-2 justify-start rounded-md overflow-y-auto">
      <Link
        className="flex items-center space-x-4"
        href={`/project/${project.ID}`}
        key={project.ID}
      >
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
      </Link>
      <DashboardProjectItemActions
        project={project}
        onActionClick={onActionClick}
      />
    </section>
  )
}

function ProjectList() {
  const [showManageProjects, setShowManageProjects] = useState(false)
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
    <>
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

      {/* Manage Projects */}
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
      <div className="flex flex-row space-x-2 h-full w-full max-h-full overflow-x-auto">
        {projects.map((project, index) => (
          <Fragment key={index}>
            {!!index && <Hr />}
            <DashboardProjectItem
              project={project}
              onActionClick={(action) => {
                setActionPeekItem(action)
                setShowActionPeek(true)
              }}
            />
          </Fragment>
        ))}
      </div>
    </>
  )
}

function DashboardMeeting() {
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
          badge={upcomingMeetings.length}
        />
      </div>
      <TagList>
        {upcomingMeetings.map((meeting) => {
          const meetingDate = new Date(meeting.start_date)
          return (
            <div
              key={meeting.ID}
              className="w-full p-4 flex flex-col space-y-1 bg-neutral-900 hover:bg-neutral-950 border border-neutral-700 rounded-md max-w-sm"
            >
              <h3 className="text-lg font-semibold">{meeting.name}</h3>
              <p className="text-neutral-400 flex space-x-2 items-center">
                <span>
                  <RelativeDate date={new Date(meeting.start_date)} />
                </span>
                {/* Show time remaining until meeting starts */}
                <DurationTag date={meetingDate} />
              </p>
              <Button
                href={`/project/${meeting.project_id}/meeting/${meeting.ID}`}
                className="w-fit text-sm"
                icon={<BsArrowRight />}
              >
                View Meeting
              </Button>
            </div>
          )
        })}
      </TagList>
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
    <div className="p-10 bg-neutral-900 w-full flex flex-col space-y-6 overflow-y-auto">
      <Head>
        <title>Perplex - Dashboard</title>
      </Head>
      <div>
        <h1 className="text-5xl text-neutral-400">
          {greeting}
          <span className="text-white font-bold">
            <ResolveUserName userID={user!.uid} />
          </span>
          !
        </h1>
        <Hr className="mt-4" />
      </div>
      <div className="h-full max-h-full">
        <DashboardMeeting />
        <Hr className="my-4" />
        <ProjectList />
      </div>
    </div>
  )
}
