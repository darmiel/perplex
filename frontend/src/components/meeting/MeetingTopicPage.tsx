import { BsArrowDown } from "react-icons/bs"

import { navigationBorderRight } from "@/api/classes"
import TopicList from "@/components/topic/TopicList"
import TopicOverview from "@/components/topic/TopicOverview"
import { useLocalBoolState } from "@/hooks/localStorage"

export default function MeetingTopicPage({
  projectID,
  meetingID,
  topicID,
}: {
  projectID: number
  meetingID: number
  topicID: number
}) {
  const [showTopicList, setShowTopicList] = useLocalBoolState(
    "topic-overview/show-topics",
    true,
  )
  return (
    <div className="flex h-full flex-row overflow-y-auto">
      {showTopicList ? (
        <div
          className={`${navigationBorderRight} w-[21rem] flex-initial bg-section-darker p-6`}
        >
          <TopicList
            projectID={projectID}
            meetingID={meetingID}
            selectedTopicID={topicID}
            onCollapse={() => setShowTopicList(false)}
          />
        </div>
      ) : (
        <div
          className={`${navigationBorderRight} w-[4rem] flex-initial space-y-4 bg-section-darker p-6`}
        >
          <h2 className="mt-20 -rotate-90 text-center text-neutral-400">
            <button
              onClick={() => setShowTopicList(true)}
              className="flex items-center justify-center space-x-2 rounded-md border border-neutral-600 bg-neutral-900 px-4 py-1"
            >
              <div>Topics</div>
              <BsArrowDown color="gray" size="1em" />
            </button>
          </h2>
        </div>
      )}

      <div className="flex-auto overflow-y-auto bg-neutral-950 p-6">
        <TopicOverview
          key={topicID}
          projectID={projectID}
          meetingID={meetingID}
          topicID={topicID}
        />
      </div>
    </div>
  )
}
