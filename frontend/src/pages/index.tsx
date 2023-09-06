"use client"

import { Avatar, Breadcrumbs, Input, Page, useInput } from "@geist-ui/core"
import Head from "next/head"
import Link from "next/link"
import { Fragment, useMemo, useState } from "react"
import { BsArrowDown, BsArrowUp, BsGear, BsSearch } from "react-icons/bs"
import { BarLoader } from "react-spinners"

import { Action, Project } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import ActionListItemSmall from "@/components/action/ActionListItemSmall"
import ActionPeekModal from "@/components/action/modals/ActionItemPeek"
import ProjectModalManageProjects from "@/components/project/modals/ProjectModalManageProjects"
import ResolveProjectName from "@/components/resolve/ResolveProjectName"
import ResolveUserName from "@/components/resolve/ResolveUserName"
import BadgeHeader from "@/components/ui/BadgeHeader"
import Button from "@/components/ui/Button"
import { RelativeDate } from "@/components/ui/DateString"
import DurationTag from "@/components/ui/DurationTag"
import Hr from "@/components/ui/Hr"
import Flex from "@/components/ui/layout/Flex"
import ModalPopup from "@/components/ui/modal/ModalPopup"
import UserAvatar, { getUserAvatarURL } from "@/components/user/UserAvatar"
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
      <div className="flex flex-col space-y-1 border-l-4 border-l-primary-600 bg-neutral-950 px-2 py-2 text-neutral-400">
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
            className="w-fit text-xs"
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
              className="flex w-full max-w-sm flex-col space-x-2 space-y-1 rounded-md border border-neutral-700 bg-neutral-900 p-3 hover:bg-neutral-950"
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
    <section className="flex h-fit flex-col justify-start space-y-2 overflow-y-auto rounded-md p-4">
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
        <button onClick={() => setShowManageProjects(true)} className="group">
          <span className="flex animate-pulse items-center space-x-2 rounded-md bg-neutral-700 bg-opacity-0 px-2 py-1 text-xs text-neutral-400 transition duration-300 hover:scale-105 hover:bg-opacity-100 hover:text-white">
            <span className="inline-block group-hover:animate-spin">
              <BsGear />
            </span>
            <span>Manage Projects</span>
          </span>
        </button>
      </div>
      <div className="flex w-full flex-row space-x-2">
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
          .map((meeting) => {
            const meetingDate = new Date(meeting.start_date)
            return (
              <div
                key={meeting.ID}
                // className="space-y-1 bg-neutral-900 hover:bg-neutral-950 border border-neutral-700 rounded-md max-w-sm"
                className="flex w-full flex-col space-y-1 rounded-lg border border-neutral-800 px-5 py-4 transition-colors hover:border-neutral-700 hover:bg-neutral-800/30"
              >
                <Breadcrumbs>
                  <Breadcrumbs.Item href={`/project/${meeting.project_id}`}>
                    <ResolveProjectName projectID={meeting.project_id} />
                  </Breadcrumbs.Item>
                </Breadcrumbs>
                <h3 className="text-lg font-semibold">{meeting.name}</h3>
                <p className="flex items-center space-x-2 text-neutral-400">
                  <span>
                    <RelativeDate date={new Date(meeting.start_date)} />
                  </span>
                  {/* Show time remaining until meeting starts */}
                  <DurationTag date={meetingDate} />
                </p>
                <Flex justify="between">
                  <Button
                    href={`/project/${meeting.project_id}/meeting/${meeting.ID}`}
                    style={["neutral", "animated"]}
                  >
                    View Meeting
                    <Button.Arrow />
                  </Button>
                  <Avatar.Group
                    count={
                      meeting.assigned_users.length > 3
                        ? meeting.assigned_users.length - 3
                        : undefined
                    }
                  >
                    {meeting.assigned_users.map(
                      (user, index) =>
                        index < 3 && (
                          <Avatar
                            key={user.id}
                            src={getUserAvatarURL(user.id)}
                            stacked
                          />
                        ),
                    )}
                  </Avatar.Group>
                </Flex>
              </div>
            )
          })}
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
