import { useQuery } from "@tanstack/react-query"
import { CommentType } from "@/components/topic/TopicOverview"
import UserComment from "@/components/comment/UserComment"
import { useAuth } from "@/contexts/AuthContext"
import { BackendResponse } from "@/api/types"
import { BarLoader } from "react-spinners"
import { extractErrorMessage } from "@/api/util"

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
    queryKey: [{ projectID }, { meetingID }, { topicID }, "comment-list"],
    queryFn: async () =>
      (
        await axios!.get(
          `/project/${projectID}/meeting/${meetingID}/topic/${topicID}/comment`,
        )
      ).data,
    refetchInterval: 1000,
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
          author={c.author_id}
          time={c.CreatedAt}
          message={c.content}
          solution={c.ID === topicSolutionCommentID}
        />
      ))}
    </div>
  )
}
