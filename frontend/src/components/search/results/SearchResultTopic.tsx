import Link from "next/link"

import { Topic } from "@/api/types"
import TopicTag from "@/components/topic/TopicTag"
import ResolveUserName from "@/components/user/ResolveUserName"

export default function SearchResultTopic({
  topic,
  topicMap,
  onClick,
}: {
  topic: Topic
  topicMap: { [key: number]: number }
  onClick: () => void
}) {
  return (
    <Link
      href={`/project/${topicMap[topic.ID] ?? "unknown"}/meeting/${
        topic.meeting_id
      }/topic/${topic.ID}`}
      key={topic.ID}
      className="flex items-center space-x-2 p-2 rounded-md hover:bg-neutral-800"
      onClick={() => onClick()}
    >
      <TopicTag className="text-xs" topic={topic} />
      <div className="flex flex-col">
        <h4 className="text-sm">
          <p className="text-xs text-neutral-500">
            {topic.Meeting?.name ?? "Unknown Meeting"}
          </p>
          <span className="text-white flex items-center space-x-1">
            <span>{topic.title}</span>
            <span className="text-neutral-400">
              by <ResolveUserName userID={topic.creator_id} />
            </span>
          </span>
        </h4>
      </div>
    </Link>
  )
}
