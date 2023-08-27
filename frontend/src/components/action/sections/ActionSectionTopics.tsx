import { Action } from "@/api/types"
import TopicCard from "@/components/topic/TopicCard"
import TagList from "@/components/ui/tag/TagList"

export default function ActionSectionTopics({ action }: { action: Action }) {
  return (
    <>
      <h1 className="font-semibold text-xl flex items-center space-x-2 mb-4">
        <span>Linked Topics</span>
        <div className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-neutral-700 rounded-full">
          {action.topics.length}
        </div>
      </h1>
      <div className="w-full">
        <TagList>
          {action.topics.map((topic) => (
            <TopicCard
              key={topic.ID}
              disabled
              projectID={String(action.project_id)}
              meetingID={String(topic.meeting_id)}
              topic={topic}
            />
          ))}
        </TagList>
      </div>
    </>
  )
}
