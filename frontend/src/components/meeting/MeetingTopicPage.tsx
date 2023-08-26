import { NextRouter } from "next/router"

import TopicList from "@/components/topic/TopicList"
import TopicOverview from "@/components/topic/TopicOverview"

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
