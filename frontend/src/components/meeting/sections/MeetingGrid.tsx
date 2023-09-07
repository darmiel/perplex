import { Input, useInput } from "@geist-ui/core"
import { ReactNode } from "react"
import { BsSearch } from "react-icons/bs"
import { BarLoader } from "react-spinners"

import { extractErrorMessage } from "@/api/util"
import MeetingCardLarge from "@/components/meeting/cards/MeetingCardLarge"
import BadgeHeader from "@/components/ui/BadgeHeader"
import Flex from "@/components/ui/layout/Flex"
import { useAuth } from "@/contexts/AuthContext"

export function MeetingGrid({
  projectID,
  upcomingOnly,
  slots,
}: {
  projectID?: number
  upcomingOnly?: boolean
  slots?: ReactNode
}) {
  const { state: search, bindings: searchBindings } = useInput("")

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
        !search || meeting.name.toLowerCase().includes(search.toLowerCase()),
    )

  // sort meetings by start date
  meetings?.sort((a, b) => {
    const aDate = new Date(a.start_date)
    const bDate = new Date(b.start_date)
    return bDate.getTime() - aDate.getTime()
  })

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
        icon={<BsSearch />}
        placeholder={`Search in ${title}...`}
        width="100%"
        {...searchBindings}
      />
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {meetings?.map((meeting) => (
          <MeetingCardLarge key={meeting.ID} meeting={meeting} />
        ))}
      </div>
    </section>
  )
}
