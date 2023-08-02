import MeetingOverview from "@/components/meeting/MeetingList"
import Navbar from "@/components/navbar/Navbar"
import TopicList, { dummyTopics } from "@/components/topic/TopicList"
import TopicOverview from "@/components/topic/TopicOverview"
import { AuthProvider } from "@/contexts/AuthContext"
import { useRouter } from "next/router"

export default function ProjectPage() {
  const router = useRouter()
  const {
    project_id: projectID,
    meeting_id: meetingID,
    topic_id: topicID,
  } = router.query
  const currentTopic = dummyTopics.find((t) => String(t.ID) === topicID)
  return (
    <AuthProvider>
      <div className="flex">
        <Navbar />

        <div className="flex-none w-2/12 bg-neutral-900 p-6 border-x border-neutral-700 space-y-4">
          <MeetingOverview
            projectID={String(projectID)}
            meetingID={String(meetingID)}
            router={router}
          />
        </div>

        <div className="flex-none bg-neutral-950 p-6 pl-10 w-3/12">
          <TopicList
            router={router}
            projectID={String(projectID)}
            meetingID={String(meetingID)}
            topicID={String(topicID)}
            topics={dummyTopics}
          />
        </div>

        <div className="flex-auto bg-neutral-950 p-6">
          {currentTopic && (
            <TopicOverview
              title={currentTopic.title}
              type={currentTopic.force_solution ? "Discuss" : "Acknowledge"}
              description={currentTopic.description}
            />
          )}
        </div>
      </div>
    </AuthProvider>
  )
}
