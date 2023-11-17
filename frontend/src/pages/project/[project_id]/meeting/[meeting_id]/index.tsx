import { useRouter } from "next/router"

import MeetingOverview from "@/components/meeting/MeetingOverview"

export default function ProjectPage() {
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
    <div className="w-full bg-neutral-950 p-6 pl-10">
      <MeetingOverview
        key={meetingID}
        projectID={projectID}
        meetingID={meetingID}
      />
    </div>
  )
}
