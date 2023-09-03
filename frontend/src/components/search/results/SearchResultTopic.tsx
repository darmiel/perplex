import Link from "next/link"

import { Topic } from "@/api/types"
import ResolveUserName from "@/components/resolve/ResolveUserName"
import TopicTag from "@/components/topic/TopicTag"

export default function SearchResultTopic({
  topic,
  topicMap,
  onClick,
  onMouseOver,
}: {
  topic: Topic
  topicMap: { [key: number]: number }
  onClick: () => void
  onMouseOver: (link: string) => void
}) {
  const href = `/project/${topicMap[topic.ID] ?? "unknown"}/meeting/${
    topic.meeting_id
  }/topic/${topic.ID}`
  return (
    <Link
      href={href}
      key={topic.ID}
      className="flex items-center space-x-2 rounded-md p-2 hover:bg-neutral-800"
      onClick={() => onClick()}
      onMouseEnter={() => onMouseOver(href)}
    >
      <TopicTag className="text-xs" topic={topic} />
      <div className="flex flex-col">
        <h4 className="text-sm">
          <p className="text-xs text-neutral-500">
            {topic.Meeting?.name ?? "Unknown Meeting"}
          </p>
          <span className="flex items-center space-x-1 text-white">
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
