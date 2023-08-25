import { useRouter } from "next/router"
import { useState } from "react"
import { BsArrowDown } from "react-icons/bs"

import MeetingList from "@/components/meeting/MeetingList"
import TopicList from "@/components/topic/TopicList"
import TopicOverview from "@/components/topic/TopicOverview"

export default function ProjectPage() {
  const router = useRouter()
  const {
    project_id: projectID,
    meeting_id: meetingID,
    topic_id: topicID,
  } = router.query

  const [showMeetingList, setShowMeetingList] = useState(false)

  return (
    <>
      {showMeetingList ? (
        <div className="flex-initial w-[21rem] bg-neutral-950 p-6 border-x border-neutral-700 space-y-4">
          <MeetingList
            projectID={String(projectID)}
            meetingID={String(meetingID)}
            onCollapse={() => setShowMeetingList(false)}
          />
        </div>
      ) : (
        <div className="flex-initial w-[4rem] bg-neutral-950 p-6 border-x border-neutral-700 space-y-4">
          <h2 className="text-center mt-24 text-neutral-400 -rotate-90">
            <button
              onClick={() => setShowMeetingList(true)}
              className="bg-neutral-900 border border-neutral-600 rounded-md px-4 py-1 flex justify-center items-center space-x-2"
            >
              <div>Meetings</div>
              <BsArrowDown color="gray" size="1em" />
            </button>
          </h2>
        </div>
      )}

      <div className="flex-initial w-[21rem] bg-neutral-950 p-6 border-r border-neutral-700">
        <TopicList
          projectID={String(projectID)}
          meetingID={String(meetingID)}
          selectedTopicID={String(topicID)}
          setSelectedTopicID={(topicID) => {
            router.push(
              `/project/${projectID}/meeting/${meetingID}/topic/${topicID}`,
            )
          }}
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
