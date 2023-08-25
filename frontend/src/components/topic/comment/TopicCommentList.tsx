import { useQuery } from "@tanstack/react-query"
import { BarLoader } from "react-spinners"

import { BackendResponse, CommentType } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import UserComment from "@/components/topic/comment/UserComment"
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
  const {
    commentListQueryFn: topicCommentQueryFn,
    commentListQueryKey: topicCommentQueryKey,
  } = useAuth()

  const topicCommentQuery = useQuery<BackendResponse<CommentType[]>>({
    queryKey: topicCommentQueryKey!(projectID, meetingID, topicID),
    queryFn: topicCommentQueryFn!(projectID, meetingID, topicID),
  })
  if (topicCommentQuery.isLoading) {
    return <BarLoader color="white" />
  }
  if (topicCommentQuery.isError) {
    return (
      <div>
        Error: <pre>{extractErrorMessage(topicCommentQuery.error)}</pre>
      </div>
    )
  }

  const comments = topicCommentQuery.data.data

  return (
    <div>
      {comments.map((c, index) => (
        <UserComment
          key={index}
          authorID={c.author_id}
          time={c.CreatedAt}
          message={c.content}
          solution={c.ID === topicSolutionCommentID}
        />
      ))}
    </div>
  )
}
