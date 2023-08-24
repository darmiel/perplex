import { useQuery } from "@tanstack/react-query"
import { BarLoader } from "react-spinners"

import { BackendResponse } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import UserComment from "@/components/comment/UserComment"
import { CommentType } from "@/components/topic/TopicOverview"
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

  const topicCommentQuery = useQuery<BackendResponse<CommentType[]>>({
    queryKey: [{ projectID }, { meetingID }, { topicID }, "comments"],
    queryFn: async () =>
      (
        await axios!.get(
          `/project/${projectID}/meeting/${meetingID}/topic/${topicID}/comment`,
        )
      ).data,
    // refetchInterval: 1000,
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
