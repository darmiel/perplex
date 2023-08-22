import { NextRouter } from "next/router"
import MeetingCard from "./MeetingCard"
import { useEffect, useState } from "react"
import { authFetch, buildUrl } from "@/api/backend"
import { useAuth } from "@/contexts/AuthContext"
import { User } from "firebase/auth"

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
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const { user } = useAuth()

  async function update(user: User, projectID: string) {
    const token = await user.getIdToken()
    const res = await authFetch(
      token,
      buildUrl(["project", projectID, "meeting"])
    )
    if (res.success) {
      setMeetings(res.data as Meeting[])
    }
  }

  async function create() {
    if (!user) {
      alert("User not logged in")
      return
    }
    const title = prompt("Title")
    const date = prompt("Start Date")
    const token = await user.getIdToken()
    const res = await authFetch(
      token,
      buildUrl(["project", projectID, "meeting"]),
      {
        method: "POST",
        body: JSON.stringify({
          name: title,
          start_date: date,
        }),
      }
    )
    if (res.success) {
      update(user, projectID)
    } else {
      alert("error: " + res.error)
    }
  }

  useEffect(() => {
    if (!user) {
      return
    }
    update(user, projectID)
  }, [user, projectID, meetingID])

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
      <div
        className="border border-neutral-500 px-4 py-2 text-center"
        onClick={() => create()}
      >
        Create Meeting
      </div>
    </>
  )
}
