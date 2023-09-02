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
    <div className="flex flex-row h-full overflow-y-auto">
      {showTopicList ? (
        <div className={`${navigationBorderRight} flex-initial w-[21rem] bg-section-darker p-6`}>
          <TopicList
            projectID={projectID}
            meetingID={meetingID}
            selectedTopicID={topicID}
            onCollapse={() => setShowTopicList(false)}
          />
        </div>
      ) : (
        <div className={`${navigationBorderRight} flex-initial w-[4rem] bg-section-darker p-6 space-y-4`}>
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
          projectID={projectID}
          meetingID={meetingID}
          topicID={topicID}
        />
      </div>
    </div>
  )
}
