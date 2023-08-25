import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { BsArrowLeft, BsPlusCircle } from "react-icons/bs"
import { BarLoader } from "react-spinners"

import { BackendResponse, Meeting } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import Button from "@/components/ui/Button"
import { useAuth } from "@/contexts/AuthContext"

import CardContainer from "../ui/card/CardContainer"
import { TruncateSubTitle, TruncateTitle } from "../ui/text/TruncateText"

export default function MeetingList({
  meetingID,
  projectID,
  onCollapse,
}: {
  meetingID?: string
  projectID: string
  onCollapse?: () => void
}) {
  const { meetingListQueryFn, meetingListQueryKey } = useAuth()

  const listMeetingQuery = useQuery<BackendResponse<Meeting[]>>({
    queryKey: meetingListQueryKey!(projectID),
    queryFn: meetingListQueryFn!(projectID),
  })
  if (listMeetingQuery.isLoading) {
    return <BarLoader color="white" />
  }
  if (listMeetingQuery.isError) {
    return (
      <div>
        Error: <pre>{extractErrorMessage(listMeetingQuery.error)}</pre>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-row space-x-2">
        <Button
          // onClick={() => (true)}
          style="neutral"
          icon={<BsPlusCircle color="gray" size="1em" />}
          className="w-full"
        >
          Create Meeting
        </Button>
        <Button onClick={onCollapse} style="neutral">
          <BsArrowLeft color="gray" size="1em" />
        </Button>
      </div>

      <hr className="mt-4 mb-6 border-gray-700" />

      {listMeetingQuery.data.data.map((meeting, key) => (
        <div key={key}>
          <Link href={`/project/${projectID}/meeting/${meeting.ID}`}>
            <CardContainer
              style={
                meetingID === String(meeting.ID) ? "selected-border" : "neutral"
              }
            >
              <TruncateTitle truncate={26}>{meeting.name}</TruncateTitle>
              <TruncateSubTitle truncate={36}>
                {meeting.start_date}
              </TruncateSubTitle>
            </CardContainer>
          </Link>
        </div>
      ))}
    </>
  )
}
