import MeetingOverview from "@/components/meeting/MeetingList"
import TopicList from "@/components/topic/TopicList"
import { useRouter } from "next/router"

export default function ProjectPage() {
  const router = useRouter()
  const { project_id: projectID, meeting_id: meetingID } = router.query
  return (
    <>
      <div className="flex-none w-4/12 bg-neutral-900 p-6 border-x border-neutral-700 space-y-4">
        <MeetingOverview
          projectID={String(projectID)}
          meetingID={String(meetingID)}
          router={router}
        />
      </div>

      <div className="flex-none w-8/12 bg-neutral-950 p-6 pl-10">
        <TopicList
          projectID={String(projectID)}
          meetingID={String(meetingID)}
        />
      </div>
    </>
  )
}
