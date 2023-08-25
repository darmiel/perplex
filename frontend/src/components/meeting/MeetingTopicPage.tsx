import { NextRouter } from "next/router"

import TopicList from "../topic/TopicList"
import TopicOverview from "../topic/TopicOverview"

export default function MeetingTopicPage({
  projectID,
  meetingID,
  topicID,
  router,
}: {
  projectID: string
  meetingID: string
  topicID: string
  router: NextRouter
}) {
  return (
    <div className="flex flex-row h-full">
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
    </div>
  )
}
