import { BarLoader } from "react-spinners"

import { Comment, CommentEntityType } from "@/api/types"
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
  onShiftSend,
  boxDescription,
}: {
  projectID: number
  commentType: CommentEntityType
  commentEntityID: number
  commentSolutionID?: number
  listClassName?: string
  onSolutionClick?: (mark: boolean, comment: Comment) => void
  isSolutionMutLoading?: boolean
  onShiftSend?: (comment: Comment) => void
  boxDescription?: string | React.ReactNode
}) {
  const { comments: comment } = useAuth()

  const listCommentQuery = comment!.useList(
    projectID,
    commentType,
    commentEntityID,
  )
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
      <h1 className="flex items-center space-x-2 text-xl font-semibold">
        <span>Conversation</span>
        <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-700 text-xs font-bold text-white">
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
        onShiftSend={onShiftSend}
        boxDescription={boxDescription}
      />
    </>
  )
}
