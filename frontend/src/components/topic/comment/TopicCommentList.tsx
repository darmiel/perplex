import { useQuery } from "@tanstack/react-query"
import { BarLoader } from "react-spinners"

import { BackendResponse, CommentType } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import TopicCommentBox from "@/components/topic/comment/TopicCommentBox"
import UserComment from "@/components/topic/comment/UserComment"
import Hr from "@/components/ui/Hr"
import { useAuth } from "@/contexts/AuthContext"

export default function TopicCommentList({
  projectID,
  meetingID,
  topicID,
  topicSolutionCommentID,
  className = "",
}: {
  projectID: string
  meetingID: string
  topicID: string
  topicSolutionCommentID?: number
  className?: string
}) {
  const { commentListQueryFn, commentListQueryKey } = useAuth()

  const topicCommentQuery = useQuery<BackendResponse<CommentType[]>>({
    queryKey: commentListQueryKey!(projectID, meetingID, topicID),
    queryFn: commentListQueryFn!(projectID, meetingID, topicID),
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
    <>
      <h1 className="font-semibold text-xl flex items-center space-x-2">
        <span>Conversation</span>
        <div className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-neutral-700 rounded-full">
          {comments.length}
        </div>
      </h1>
      <div className={`space-y-4 ${className}`}>
        {comments.map((c, index) => (
          <div key={index}>
            {!!index && <Hr />}
            <UserComment
              projectID={projectID}
              meetingID={meetingID}
              topicID={topicID}
              comment={c}
              solution={c.ID === topicSolutionCommentID}
            />
          </div>
        ))}
      </div>
      <TopicCommentBox
        className="mt-4"
        projectID={projectID}
        meetingID={meetingID}
        topicID={topicID}
      />
    </>
  )
}
