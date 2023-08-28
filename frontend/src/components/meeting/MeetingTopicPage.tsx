import { NextRouter } from "next/router"
import { useState } from "react"
import { BsArrowDown } from "react-icons/bs"

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
  const [showTopicList, setShowTopicList] = useState(true)
  return (
    <div className="flex flex-row h-full max-h-screen">
      {showTopicList ? (
        <div className="flex-initial w-[21rem] bg-neutral-900 p-6 border-r border-neutral-700">
          <TopicList
            projectID={String(projectID)}
            meetingID={String(meetingID)}
            selectedTopicID={String(topicID)}
            onCollapse={() => setShowTopicList(false)}
          />
        </div>
      ) : (
        <div className="flex-initial w-[4rem] bg-neutral-950 p-6 border-x border-neutral-700 space-y-4">
          <h2 className="text-center mt-20 text-neutral-400 -rotate-90">
            <button
              onClick={() => setShowTopicList(true)}
              className="bg-neutral-900 border border-neutral-600 rounded-md px-4 py-1 flex justify-center items-center space-x-2"
            >
              <div>Topics</div>
              <BsArrowDown color="gray" size="1em" />
            </button>
          </h2>
        </div>
      )}

      <div className="flex-auto bg-neutral-950 p-6">
        <TopicOverview
          key={topicID}
          projectID={String(projectID)}
          meetingID={String(meetingID)}
          topicID={String(topicID)}
        />
      </div>
    </div>
  )
}
