import { useRouter } from "next/router"

import { navigationBorderRight } from "@/api/classes"
import MeetingList from "@/components/meeting/MeetingList"
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
    <>
      <div className={`${navigationBorderRight} flex-initial w-[25rem] bg-section-darker p-6 space-y-4`}>
        <MeetingList projectID={projectID} selectedMeetingID={meetingID} />
      </div>

      <div className="w-full bg-neutral-950 p-6 pl-10">
        <MeetingOverview
          key={meetingID}
          projectID={projectID}
          meetingID={meetingID}
        />
      </div>
    </>
  )
}
