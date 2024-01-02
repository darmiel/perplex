import { Input } from "@nextui-org/react"
import { ReactNode, useState } from "react"
import { BsSearch } from "react-icons/bs"
import { BarLoader } from "react-spinners"

import { extractErrorMessage, includesFold } from "@/api/util"
import MeetingCardLarge from "@/components/meeting/cards/MeetingCardLarge"
import BadgeHeader from "@/components/ui/BadgeHeader"
import GlowingCards from "@/components/ui/card/glow/GlowingCardsContainer"
import Flex from "@/components/ui/layout/Flex"
import { useAuth } from "@/contexts/AuthContext"

export function MeetingGrid({
  projectID,
  upcomingOnly,
  reversed,
  slots,
}: {
  projectID?: number
  upcomingOnly?: boolean
  reversed?: boolean
  slots?: ReactNode
}) {
  const [filter, setFilter] = useState("")

  if (!upcomingOnly && projectID === undefined) {
    throw new Error("projectID must be defined if upcomingMeetings is false")
  }

  const { meetings: meetingDB } = useAuth()
  const meetingListQuery =
    projectID === undefined
      ? meetingDB!.useListUpcoming()
      : meetingDB!.useList(projectID!)

  const title = upcomingOnly ? "Upcoming Meetings" : "Meetings"

  if (meetingListQuery.isLoading) {
    return <BarLoader />
  }
  if (meetingListQuery.isError) {
    return (
      <>
        Error loading upcoming meetings:{" "}
        {extractErrorMessage(meetingListQuery.error)}
      </>
    )
  }
  const meetings = meetingListQuery.data.data
    ?.filter(
      (meeting) =>
        !upcomingOnly || !projectID || new Date(meeting.end_date) > new Date(),
    )
    .filter(
      (meeting) =>
        !filter ||
        includesFold(meeting.name, filter) ||
        includesFold(meeting.description, filter),
    )
    .sort((a, b) => {
      const aDate = new Date(a.start_date)
      const bDate = new Date(b.start_date)
      return !reversed
        ? bDate.getTime() - aDate.getTime()
        : aDate.getTime() - bDate.getTime()
    })
  console.log("grid meetings:", meetings)

  return (
    <section className="space-y-4">
      <Flex x={4}>
        <BadgeHeader
          title={title}
          className="text-2xl font-semibold"
          badge={meetings?.length || 0}
        />
        {slots}
      </Flex>
      <Input
        variant="bordered"
        value={filter}
        onValueChange={setFilter}
        startContent={<BsSearch />}
        placeholder={`Search in ${title}...`}
        fullWidth
        size="sm"
      />
      <GlowingCards className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {meetings?.map((meeting) => (
          <MeetingCardLarge key={meeting.ID} meeting={meeting} />
        ))}
      </GlowingCards>
    </section>
  )
}
