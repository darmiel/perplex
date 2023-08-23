import TopicCard from "@/components/topic/TopicCard"
import { useAuth } from "@/contexts/AuthContext"
import { CommentType } from "@/components/topic/TopicOverview"
import { useQuery } from "@tanstack/react-query"
import { create } from "domain"
import { extractErrorMessage } from "@/api/util"
import Button from "../controls/Button"

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
    queryKey: [{ projectID }, { meetingID }, "topics"],
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
        Error: <pre>{extractErrorMessage(topicListQuery.error)}</pre>
      </div>
    )
  }

  const checkedTopicCount = topicListQuery.data.data.filter(
    (topic) => topic.closed_at.Valid,
  ).length

  const checkedTopicRatio = checkedTopicCount / topicListQuery.data.data.length

  const showTopicListWithFilter = (filter: (topic: Topic) => boolean) => {
    return topicListQuery.data.data.filter(filter).map((topic) => (
      <div key={topic.ID}>
        <TopicCard
          title={topic.title}
          description={topic.description}
          projectID={projectID}
          meetingID={meetingID}
          topicID={String(topic.ID)}
          active={selectedTopicID === String(topic.ID)}
          checked={topic.closed_at.Valid}
        />
      </div>
    ))
  }

  return (
    <ul className="space-y-4">
      {/* ProgressBar */}
      <div>
        <div className="w-full rounded-full h-2.5 bg-gray-700">
          <div
            className="bg-purple-600 h-2.5 rounded-full w-[45%]"
            style={{
              width: `${checkedTopicRatio * 100}%`,
            }}
          ></div>
        </div>
        <div className="text-center mt-2 text-gray-500">
          <span className="text-white">{checkedTopicCount}</span> /{" "}
          {topicListQuery.data.data.length} topics done
        </div>
        <hr className="mt-4 mb-6 border-gray-700" />
      </div>

      {/* Topic List (Open Topics) */}
      {showTopicListWithFilter((topic) => !topic.closed_at.Valid)}

      <hr className="mt-4 mb-6 border-gray-700" />

      {/* Topic List (Closed Topics) */}
      {showTopicListWithFilter((topic) => topic.closed_at.Valid)}

      <Button>Create Topic</Button>
    </ul>
  )
}
