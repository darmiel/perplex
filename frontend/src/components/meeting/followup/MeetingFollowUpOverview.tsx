import {
  Accordion,
  AccordionItem,
  BreadcrumbItem,
  Breadcrumbs,
  Divider,
  ScrollShadow,
} from "@nextui-org/react"
import Head from "next/head"
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
            <GlowingCard
              classNames={{
                content:
                  "bg-black py-4 px-6 flex items-center justify-between space-x-4",
              }}
              style={{
                "--glow-color": "251, 146, 60",
              }}
            >
              <Flex col>
                <h2 className="text-tiny uppercase text-neutral-400">
                  Open Actions
                </h2>
                <h1 className="text-4xl font-bold text-orange-600">2</h1>
              </Flex>
              <BsChevronRight className="text-neutral-400" />
              <Flex col>
                <h2 className="text-tiny uppercase text-neutral-400">
                  Closed Actions
                </h2>
                <h1 className="text-4xl font-bold">11</h1>
              </Flex>
            </GlowingCard>

            <GlowingCard
              classNames={{
                content:
                  "bg-black py-4 px-6 flex items-center justify-between space-x-4",
              }}
            >
              <Flex col>
                <h2 className="text-tiny uppercase text-neutral-400">
                  Open Topics
                </h2>
                <h1 className="text-4xl font-bold text-white">0</h1>
              </Flex>
              <BsChevronRight className="text-neutral-400" />
              <Flex col>
                <h2 className="text-tiny uppercase text-neutral-400">
                  Closed Topics
                </h2>
                <h1 className="text-4xl font-bold">11</h1>
              </Flex>
            </GlowingCard>
          </GlowingCards>
        </main>
      </div>
    </div>
  )
}
