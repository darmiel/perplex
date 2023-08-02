import { NextRouter } from "next/router"
import MeetingCard from "./MeetingCard"

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
  const meetings: Meeting[] = [
    {
      ID: 1,
      name: "My First Meeting 😊",
      start_date: "12.08.2023 17:05 Uhr",
    },
    {
      ID: 2,
      name: "My Second Meeting 😊",
      start_date: "12.08.2023 17:05 Uhr",
    },
  ]
  return (
    <>
      {meetings.map((meeting, key) => (
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
    </>
  )
}
