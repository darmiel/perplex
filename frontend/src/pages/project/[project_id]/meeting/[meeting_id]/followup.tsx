import { useRouter } from "next/router"

import MeetingFollowUpOverview from "@/components/meeting/followup/MeetingFollowUpOverview"

export default function FollowUpPage() {
  const router = useRouter()

  const { project_id: projectIDStr, meeting_id: meetingIDStr } = router.query
  if (
    !projectIDStr ||
    !meetingIDStr ||
    Array.isArray(projectIDStr) ||
    Array.isArray(meetingIDStr)
  ) {
    return <div>Invalid URL</div>
  }

  const projectID = Number(projectIDStr)
  const meetingID = Number(meetingIDStr)

  return (
    <div className="h-full w-full bg-black p-6">
      <MeetingFollowUpOverview projectID={projectID} meetingID={meetingID} />
    </div>
  )
}
