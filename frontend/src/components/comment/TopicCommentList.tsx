import { useQuery } from "@tanstack/react-query"
import { CommentType } from "../topic/TopicOverview"
import Comment from "./Comment"
import { useAuth } from "@/contexts/AuthContext"

export default function TopicComments({
  projectID,
  meetingID,
  topicID,
  topicSolutionCommentID,
}: {
  projectID: string
  meetingID: string
  topicID: string
  topicSolutionCommentID?: number
}) {
  const { axios } = useAuth()

  const topicCommentQuery = useQuery<{ data: CommentType[] }>({
    queryKey: [{ projectID }, { meetingID }, { topicID }, "comment-list"],
    queryFn: async () =>
      (
        await axios!.get(
          `/project/${projectID}/meeting/${meetingID}/topic/${topicID}/comment`
        )
      ).data,
  })

  if (topicCommentQuery.isLoading) {
    return <div>Loading Comments...</div>
  }
  if (topicCommentQuery.isError) {
    return (
      <div>
        Error: <pre>{JSON.stringify(topicCommentQuery.error)}</pre>
      </div>
    )
  }

  const comments = topicCommentQuery.data.data

  return (
    <div>
      {comments.map((c, index) => (
        <Comment
          key={index}
          author={c.author_id}
          time={c.CreatedAt}
          message={c.content}
          solution={c.ID === topicSolutionCommentID}
        />
      ))}
    </div>
  )
}
