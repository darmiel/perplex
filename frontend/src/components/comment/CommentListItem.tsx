import { ReactNode, useState } from "react"
import {
  BsCheck,
  BsCheckSquare,
  BsCheckSquareFill,
  BsPen,
  BsTrash,
  BsX,
} from "react-icons/bs"
import { ClipLoader } from "react-spinners"
import { toast } from "sonner"

import { Comment, CommentEntityType } from "@/api/types"
import ResolveUserName from "@/components/resolve/ResolveUserName"
import { RelativeDate } from "@/components/ui/DateString"
import { EditOrRenderMarkdown } from "@/components/ui/text/EditOrRenderMarkdown"
import UserAvatar from "@/components/user/UserAvatar"
import { useAuth } from "@/contexts/AuthContext"

function Loadable({
  loading,
  children,
}: {
  loading: boolean
  children: ReactNode
}) {
  return loading ? <ClipLoader color="orange" size={16} /> : children
}

export default function CommentListItem({
  projectID,
  comment,
  commentType,
  commentEntityID,
  solution,
  onSolutionClick,
  isSolutionMutLoading,
}: {
  projectID: number
  comment: Comment
  commentType: CommentEntityType
  commentEntityID: number
  solution?: boolean
  onSolutionClick?: (solution: boolean) => void
  isSolutionMutLoading?: boolean
}) {
  const { user, comments: commentDB } = useAuth()

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editContent, setEditContent] = useState("")

  const deleteCommentMutation = commentDB!.useDelete(
    projectID,
    commentType,
    commentEntityID,
    (_, { commentID }) => {
      toast.success(`Comment #${commentID} deleted!`)
    },
  )

  const editCommentMutation = commentDB!.useEdit(
    projectID,
    commentType,
    commentEntityID,
    (_, { commentID }) => {
      toast.success(`Comment #${commentID} edited!`)
      setEditMode(false)
    },
  )

  const createdAtDate = new Date(Date.parse(comment.CreatedAt))
  const wasEdited = comment.CreatedAt !== comment.UpdatedAt
  const isAuthor = user?.uid === comment.author_id

  function onEditClick() {
    setEditContent(comment.content)
    setEditMode(true)
  }

  function onDeleteClick() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setConfirmDelete(false)
    deleteCommentMutation.mutate({
      commentID: comment.ID,
    })
  }

  return (
    <div
      id={`comment-${commentType}-${comment.ID}`}
      className={`flex ${
        solution ? "border-l-4 border-primary-600 py-3 pl-3" : ""
      } p-4`}
    >
      <div>
        <UserAvatar height={256} width={256} userID={comment.author_id} />
      </div>
      <div className="ml-4 flex w-full flex-col">
        <div className="flex items-center space-x-4">
          {/* Author and Creation Date */}
          <div>
            <span className="font-semibold">
              <ResolveUserName userID={comment.author_id} />
            </span>
            <span className="text-neutral-500">
              - <RelativeDate date={createdAtDate} />
            </span>
            {wasEdited && <span className="text-neutral-500"> (edited)</span>}
          </div>

          {/* Solution button */}
          {onSolutionClick && (
            <Loadable loading={isSolutionMutLoading ?? false}>
              <button onClick={() => onSolutionClick(!solution)}>
                {solution ? (
                  <div className="flex items-center space-x-2 rounded-md bg-primary-500 px-2 py-1 text-sm text-primary-100">
                    <BsCheckSquareFill />
                    <span>Marked Solution</span>
                  </div>
                ) : (
                  <BsCheckSquare />
                )}
              </button>
            </Loadable>
          )}

          {/* Edit button */}
          {isAuthor && (
            <>
              {editMode ? (
                <div className="flex items-center space-x-2 border border-primary-500 px-2 py-1">
                  <span>Edit:</span>

                  {/* Commit Edit */}
                  <Loadable loading={editCommentMutation.isLoading}>
                    <button
                      onClick={() =>
                        editCommentMutation.mutate({
                          commentID: comment.ID,
                          content: editContent,
                        })
                      }
                      className="text-primary-500"
                    >
                      <BsCheck size="20px" />
                    </button>
                  </Loadable>

                  {/* Abort Edit */}
                  <button
                    onClick={() => setEditMode(false)}
                    className="text-neutral-400"
                  >
                    <BsX size="20px" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onEditClick()}
                  className="text-neutral-400"
                >
                  <BsPen />
                </button>
              )}

              <Loadable loading={deleteCommentMutation.isLoading}>
                <button onClick={onDeleteClick} className="text-red-500">
                  {confirmDelete ? (
                    <div className="flex items-center justify-center space-x-2 text-red-500">
                      <span>Delete?</span>
                      <BsTrash />
                    </div>
                  ) : (
                    <div className="text-neutral-400">
                      <BsTrash />
                    </div>
                  )}
                </button>
              </Loadable>
            </>
          )}
        </div>
        <div className="mt-2 text-neutral-200">
          <EditOrRenderMarkdown
            isEdit={editMode}
            displayValue={comment.content}
            editValue={editContent}
            setEditValue={setEditContent}
            autoSaveId="comment-edit-md-preview"
          />
        </div>
      </div>
    </div>
  )
}
