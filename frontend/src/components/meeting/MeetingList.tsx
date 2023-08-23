import { NextRouter } from "next/router"
import MeetingCard from "@/components/meeting/MeetingCard"
import { useAuth } from "@/contexts/AuthContext"
import { useQuery } from "@tanstack/react-query"
import { BarLoader } from "react-spinners"
import { extractErrorMessage } from "@/api/util"
import { BackendResponse } from "@/api/types"

type Meeting = {
  ID: number
  name: string
  start_date: string
}

export default function MeetingOverview({
  meetingID,
  projectID,
  router,
}: {
  meetingID?: string
  projectID: string
  router: NextRouter
}) {
  const { axios } = useAuth()

  const listMeetingQuery = useQuery<BackendResponse<Meeting[]>>({
    queryKey: ["project", projectID, "meeting"],
    queryFn: async () =>
      (await axios!.get(`/project/${projectID}/meeting`)).data,
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
      {listMeetingQuery.data.data.map((meeting, key) => (
        <MeetingCard
          key={key}
          title={meeting.name}
          date={meeting.start_date}
          onClick={() =>
            router.push(`/project/${projectID}/meeting/${meeting.ID}`)
          }
          active={meetingID !== undefined && meetingID === String(meeting.ID)}
        />
      ))}
      <div className="border border-neutral-500 px-4 py-2 text-center">
        Create Meeting
      </div>
    </>
  )
}
