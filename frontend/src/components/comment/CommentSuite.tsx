import { useQuery } from "@tanstack/react-query"
import { BarLoader } from "react-spinners"

import { BackendResponse, Comment, CommentEntityType } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import CommentList from "@/components/comment/CommentList"
import CommentSendNewBox from "@/components/comment/CommentSendNewBox"
import { useAuth } from "@/contexts/AuthContext"

export default function CommentSuite({
  projectID,
  commentType,
  commentEntityID,
  commentSolutionID,
  listClassName = "",
  onSolutionClick,
  isSolutionMutLoading,
}: {
  projectID: number
  commentType: CommentEntityType
  commentEntityID: number
  commentSolutionID?: number
  listClassName?: string
  onSolutionClick?: (mark: boolean, comment: Comment) => void
  isSolutionMutLoading?: boolean
}) {
  const { commentListQueryFn, commentListQueryKey } = useAuth()

  const listCommentQuery = useQuery<BackendResponse<Comment[]>>({
    queryKey: commentListQueryKey!(projectID, commentType, commentEntityID),
    queryFn: commentListQueryFn!(projectID, commentType, commentEntityID),
  })
  if (listCommentQuery.isLoading) {
    return <BarLoader color="white" />
  }
  if (listCommentQuery.isError) {
    return (
      <>
        <strong>Cannot load comments:</strong>
        <pre>{extractErrorMessage(listCommentQuery.error)}</pre>
      </>
    )
  }

  const comments = listCommentQuery.data.data

  return (
    <>
      <h1 className="font-semibold text-xl flex items-center space-x-2">
        <span>Conversation</span>
        <div className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-neutral-700 rounded-full">
          {comments.length}
        </div>
      </h1>

      {/* Show Comment Bubbles */}
      <div className={`space-y-4 ${listClassName}`}>
        <CommentList
          projectID={projectID}
          commentEntityType={commentEntityID}
          commentType={commentType}
          commentSolutionID={commentSolutionID}
          comments={comments}
          onSolutionClick={onSolutionClick}
          isSolutionMutLoading={isSolutionMutLoading}
        />
      </div>

      {/* Show Comment Box for sending new messages */}
      <CommentSendNewBox
        className="mt-4"
        projectID={projectID}
        commentType={commentType}
        commentEntityID={commentEntityID}
      />
    </>
  )
}
