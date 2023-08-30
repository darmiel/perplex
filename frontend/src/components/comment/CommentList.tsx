import { Comment, CommentEntityType } from "@/api/types"
import CommentBubble from "@/components/comment/CommentListItem"
import Hr from "@/components/ui/Hr"

export default function CommentList({
  projectID,
  commentType,
  commentEntityType,
  commentSolutionID,
  comments,
  onSolutionClick,
  isSolutionMutLoading,
}: {
  projectID: number
  commentType: CommentEntityType
  commentEntityType: number
  commentSolutionID?: number
  comments: Comment[]
  onSolutionClick?: (mark: boolean, comment: Comment) => void
  isSolutionMutLoading?: boolean
}) {
  return comments.map((c, index) => (
    <div key={index}>
      {!!index && <Hr />}
      <CommentBubble
        projectID={projectID}
        commentType={commentType}
        commentEntityID={commentEntityType}
        comment={c}
        solution={c.ID === commentSolutionID}
        onSolutionClick={
          onSolutionClick ? (mark) => onSolutionClick(mark, c) : undefined
        }
        isSolutionMutLoading={isSolutionMutLoading}
      />
    </div>
  ))
}
