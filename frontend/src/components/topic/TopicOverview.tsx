import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { Topic } from "./TopicList"
import { useAuth } from "@/contexts/AuthContext"
import { useQuery } from "@tanstack/react-query"
import TopicCommentList from "../comment/TopicCommentList"
import TopicCommentBox from "../comment/TopicCommentBox"
import RenderMarkdown from "../text/RenderMarkdown"

export type CommentType = {
  ID: number
  author_id: string
  content: string
  CreatedAt: string
  UpdatedAt: string
}

export default function TopicOverview({
  projectID,
  meetingID,
  topicID,
}: {
  projectID: string
  meetingID: string
  topicID: string
}) {
  const [commentBoxText, setCommentBoxText] = useState("")

  const { axios } = useAuth()

  const topicInfoQuery = useQuery<{ data: Topic }>({
    queryKey: ["project", projectID, "meeting", meetingID, "topic", topicID],
    queryFn: async () =>
      (
        await axios!.get(
          `/project/${projectID}/meeting/${meetingID}/topic/${topicID}`
        )
      ).data,
  })

  // show loading scren if topic is not loaded or error
  if (topicInfoQuery.isLoading) {
    return <div>Loading...</div>
  }
  if (topicInfoQuery.isError) {
    return (
      <div>
        Error: <pre>{JSON.stringify(topicInfoQuery.error)}</pre>
      </div>
    )
  }

  const topic = topicInfoQuery.data.data

  const topicInfoProps = {
    projectID,
    meetingID,
    topicID,
  }

  return (
    <div className="flex flex-col">
      <span className="uppercase text-xs text-purple-500">
        {topic.force_solution ? "Discuss" : "Acknowledge"}
      </span>
      <h1 className="text-2xl font-bold">{topic.title}</h1>
      <span className="text-neutral-500 my-3">
        <RenderMarkdown markdown={topic.description} />
      </span>

      <TopicCommentBox key={topicID} {...topicInfoProps} />

      <TopicCommentList
        {...topicInfoProps}
        topicSolutionCommentID={topic.solution_id}
      />
    </div>
  )
}
