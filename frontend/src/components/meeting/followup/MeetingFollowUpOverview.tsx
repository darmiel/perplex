import {
  Accordion,
  AccordionItem,
  BreadcrumbItem,
  Breadcrumbs,
  Card,
  Divider,
  ScrollShadow,
} from "@nextui-org/react"
import clsx from "clsx"
import Head from "next/head"
import { Fragment, ReactNode } from "react"
import { BsChevronRight, BsHouse } from "react-icons/bs"
import { BarLoader } from "react-spinners"

import { extractErrorMessage } from "@/api/util"
import MeetingSelectBreadcrumbs from "@/components/meeting/breadcrumbs/MeetingSelectBreadcrumbs"
import { MeetingTagChips } from "@/components/meeting/MeetingTagChips"
import ProjectSelectBreadcrumbs from "@/components/project/breadcrumbs/ProjectSelectBreadcrumbs"
import GlowingCard from "@/components/ui/card/glow/GlowingCardItem"
import GlowingCards from "@/components/ui/card/glow/GlowingCardsContainer"
import Flex from "@/components/ui/layout/Flex"
import RenderMarkdown from "@/components/ui/text/RenderMarkdown"
import { useAuth } from "@/contexts/AuthContext"
import { getMeetingURL } from "@/util/url"

export default function MeetingFollowUpOverview({
  projectID,
  meetingID,
}: {
  projectID: number
  meetingID: number
}) {
  const { meetings, topics, actions } = useAuth()

  const meetingInfoQuery = meetings!.useFind(projectID, meetingID)
  const topicListQuery = topics!.useList(projectID, meetingID)
  const actionListQuery = actions!.useListForMeeting(projectID, meetingID)

  if (meetingInfoQuery.isLoading) {
    return <BarLoader color="white" />
  }
  if (meetingInfoQuery.isError) {
    return <>Error: {extractErrorMessage(meetingInfoQuery.error)}</>
  }

  const meeting = meetingInfoQuery.data.data

  const actionList = actionListQuery.data?.data ?? []
  const openActions = actionList.filter((action) => !action.closed_at.Valid)
  const closedActions = actionList.filter((action) => action.closed_at.Valid)

  const topicList = topicListQuery.data?.data ?? []
  const openTopics = topicList.filter((topic) => !topic.closed_at.Valid)
  const closedTopics = topicList.filter((topic) => topic.closed_at.Valid)

  return (
    <div className="flex h-full w-full flex-col">
      <Head>
        <title>Perplex - F/U M# {meeting.name ?? "Unknown Project"}</title>
      </Head>

      <div className="mb-4">
        <Breadcrumbs>
          <BreadcrumbItem href="/" startContent={<BsHouse />}>
            Home
          </BreadcrumbItem>
          <BreadcrumbItem href={`/project/${projectID}`}>
            <ProjectSelectBreadcrumbs projectID={projectID} />
          </BreadcrumbItem>
          <BreadcrumbItem href={getMeetingURL(projectID, meetingID)}>
            <MeetingSelectBreadcrumbs
              meetingID={meeting.ID}
              meetingName={meeting.name}
              projectID={projectID}
            />
          </BreadcrumbItem>
          <BreadcrumbItem>Follow Up</BreadcrumbItem>
        </Breadcrumbs>
      </div>

      <div className="flex w-full items-center justify-center">
        <main className="flex w-full max-w-5xl flex-col items-center space-y-3 px-10 lg:px-0">
          <section className="flex w-full flex-col items-center justify-center space-y-2">
            <h2 className="w-fit rounded-full bg-neutral-900 px-3 py-1 text-tiny font-medium uppercase text-neutral-400">
              Follow Up
            </h2>
            <h1 className="text-4xl font-semibold">{meeting.name}</h1>
            <ScrollShadow
              orientation="horizontal"
              className="max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl"
              hideScrollBar
            >
              <MeetingTagChips tags={meeting.tags} />
            </ScrollShadow>
          </section>

          {meeting.description && (
            <Accordion isCompact>
              <AccordionItem
                title="Description"
                className="rounded-md bg-neutral-900 px-4 py-2"
              >
                <RenderMarkdown markdown={meeting.description} />
              </AccordionItem>
            </Accordion>
          )}

          <Divider />

          <GlowingCards className="grid w-full gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <StatisticCard
              title="Topics"
              stats={[
                {
                  title: "Open",
                  value: openTopics.length,
                  isDanger: !!openTopics.length,
                },
                { title: "Closed", value: closedTopics.length },
              ]}
            />
            <StatisticCard
              title="Actions"
              stats={[
                {
                  title: "Open",
                  value: openActions.length,
                  isDanger: !!openActions.length,
                },
                { title: "Closed", value: closedActions.length },
              ]}
            />
            <StatisticCard
              title="Comments"
              stats={[
                { title: "During", value: 11 },
                { title: "After", value: 4 },
              ]}
            />
          </GlowingCards>
        </main>
      </div>
    </div>
  )
}

type Statistic = {
  title: string
  value: any
  isDanger?: boolean
}

function StatisticCard({
  title,
  stats,
}: {
  title: string | ReactNode
  stats: Statistic[]
}) {
  return (
    <GlowingCard
      as={Card}
      isPressable
      classNames={{
        content: "bg-neutral-900 flex flex-col items-center overflow-hidden",
      }}
    >
      <span className="w-full bg-neutral-950 p-2 text-center text-sm font-semibold uppercase text-neutral-200">
        {title}
      </span>
      <div className="flex w-full items-center justify-between space-x-4 px-6 py-4">
        {stats.map((stat, index) => (
          <Fragment key={index}>
            {index > 0 && <BsChevronRight className="text-neutral-400" />}
            <Flex col>
              <h2 className="text-tiny uppercase text-neutral-400">
                {stat.title}
              </h2>
              <h1
                className={clsx("text-4xl font-bold", {
                  "text-orange-500": stat.isDanger,
                })}
              >
                {stat.value}
              </h1>
            </Flex>
          </Fragment>
        ))}
      </div>
    </GlowingCard>
  )
}
