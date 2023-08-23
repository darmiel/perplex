import TopicCard from "@/components/topic/TopicCard"
import { useAuth } from "@/contexts/AuthContext"
import { CommentType } from "@/components/topic/TopicOverview"
import { useQuery } from "@tanstack/react-query"
import { create } from "domain"

export type Topic = {
  ID: number
  title: string
  description: string
  force_solution?: boolean
  comments: CommentType[]
  solution_id?: number
  closed_at: {
    Valid: boolean
  }
}

export default function TopicList({
  selectedTopicID,
  projectID,
  meetingID,
}: {
  selectedTopicID?: string
  projectID: string
  meetingID: string
}) {
  const { axios } = useAuth()

  const topicListQuery = useQuery<{ data: Topic[] }>({
    queryKey: ["project", projectID, "meeting", meetingID, "topics"],
    queryFn: async () =>
      (await axios!.get(`/project/${projectID}/meeting/${meetingID}/topic`))
        .data,
  })

  if (topicListQuery.isLoading) {
    return <div>Loading...</div>
  }
  if (topicListQuery.isError) {
    return (
      <div>
        Error: <pre>{JSON.stringify(topicListQuery.error)}</pre>
      </div>
    )
  }

  return (
    <ul className="space-y-4">
      {topicListQuery.data.data.map((topic, key) => (
        <TopicCard
          key={key}
          title={topic.title}
          description={topic.description}
          active={selectedTopicID === String(topic.ID)}
          link={`/project/${projectID}/meeting/${meetingID}/topic/${topic.ID}`}
          checked={topic.closed_at.Valid}
        />
      ))}
      <div
        className="border border-neutral-500 px-4 py-2 text-center"
        onClick={() => create()}
      >
        Create Topic
      </div>
    </ul>
  )
}
