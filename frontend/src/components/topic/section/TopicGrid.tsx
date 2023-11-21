import { Topic } from "@/api/types"
import TopicCardLarge from "@/components/topic/cards/TopicCardLarge"

export function TopicGrid({
  projectID,
  topics,
}: {
  projectID: number
  topics: Topic[]
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {topics.map((topic) => (
        <TopicCardLarge key={topic.ID} projectID={projectID} topic={topic} />
      ))}
    </div>
  )
}
