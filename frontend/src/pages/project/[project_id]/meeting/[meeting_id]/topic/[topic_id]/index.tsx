import MeetingOverview from "@/components/meeting/MeetingList"
import TopicList from "@/components/topic/TopicList"
import TopicOverview from "@/components/topic/TopicOverview"
import { useRouter } from "next/router"

export default function ProjectPage() {
  const router = useRouter()
  const {
    project_id: projectID,
    meeting_id: meetingID,
    topic_id: topicID,
  } = router.query

  return (
    <>
      <div className="flex-none w-3/12 bg-neutral-950 p-6 border-x border-neutral-700 space-y-4">
        <MeetingOverview
          projectID={String(projectID)}
          meetingID={String(meetingID)}
          router={router}
        />
      </div>

      <div className="flex-none bg-neutral-950 p-6 w-3/12 border-x border-neutral-700">
        <TopicList
          projectID={String(projectID)}
          meetingID={String(meetingID)}
          selectedTopicID={String(topicID)}
        />
      </div>

      <div className="flex-auto bg-neutral-950 p-6">
        <TopicOverview
          projectID={String(projectID)}
          meetingID={String(meetingID)}
          topicID={String(topicID)}
        />
      </div>
    </>
  )
}
