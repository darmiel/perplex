import { useRouter } from "next/router"

import MeetingList from "@/components/meeting/MeetingList"
import MeetingOverview from "@/components/meeting/MeetingOverview"

export default function ProjectPage() {
  const router = useRouter()

  const { project_id: projectID, meeting_id: meetingID } = router.query
  if (
    !projectID ||
    !meetingID ||
    Array.isArray(projectID) ||
    Array.isArray(meetingID)
  ) {
    return <div>Invalid URL</div>
  }

  return (
    <>
      <div className="flex-none w-4/12 bg-neutral-950 p-6 border-x border-neutral-700 space-y-4">
        <MeetingList projectID={projectID} selectedMeetingID={meetingID} />
      </div>

      <div className="flex-none w-8/12 bg-neutral-950 p-6 pl-10">
        <MeetingOverview projectID={projectID} meetingID={meetingID} />
      </div>
    </>
  )
}
