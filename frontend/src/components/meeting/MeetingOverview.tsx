import { useQuery } from "@tanstack/react-query"
import { BarLoader } from "react-spinners"

import { BackendResponse, Meeting } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import RenderMarkdown from "@/components/ui/text/RenderMarkdown"
import { useAuth } from "@/contexts/AuthContext"

import TopicList from "../topic/TopicList"
import UserTag from "../user/UserTag"

export default function MeetingOverview({
  projectID,
  meetingID,
}: {
  projectID: string
  meetingID: string
}) {
  const { meetingInfoQueryFn, meetingInfoQueryKey } = useAuth()
  const meetingInfoQuery = useQuery<BackendResponse<Meeting>>({
    queryKey: meetingInfoQueryKey!(projectID, meetingID),
    queryFn: meetingInfoQueryFn!(projectID, meetingID),
  })
  if (meetingInfoQuery.isLoading) {
    return <BarLoader color="white" />
  }
  if (meetingInfoQuery.isError) {
    return (
      <div>
        Error: <pre>{extractErrorMessage(meetingInfoQuery.error)}</pre>
      </div>
    )
  }

  const meeting = meetingInfoQuery.data.data
  const date = new Date(meeting.start_date)

  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-bold">{meeting.name}</h1>
      <span className="text-neutral-500 mt-3">
        {date.toLocaleDateString()} - {date.toLocaleTimeString()}
      </span>

      {/* Print meeting creator */}
      {meeting.creator && (
        <div className="w-fit my-4">
          <UserTag
            userID={meeting.creator.id}
            displayName={meeting.creator.name}
          />
        </div>
      )}

      <RenderMarkdown markdown={meeting.description} />

      <hr className="mt-4 mb-6 border-gray-700" />

      <TopicList projectID={projectID} meetingID={meetingID} />
    </div>
  )
}
