import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
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
import { toast } from "react-toastify"

import { BackendResponse, CommentType } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import { RelativeDate } from "@/components/ui/DateString"
import RenderMarkdown from "@/components/ui/text/RenderMarkdown"
import ResolveUserName from "@/components/user/ResolveUserName"
import UserAvatar from "@/components/user/UserAvatar"
import { useAuth } from "@/contexts/AuthContext"

function LoadingButton({
  isLoading,
  onClick,
  className = "",
  children,
}: {
  isLoading: boolean
  onClick?: () => void
  className?: string
  children: ReactNode
}) {
  return (
    <button
      onClick={() => !isLoading && onClick?.()}
      className={`text-neutral-400 ${className}`}
      disabled={isLoading}
    >
      {isLoading ? <ClipLoader color="orange" size={16} /> : children}
    </button>
  )
}

export default function UserComment({
  projectID,
  meetingID,
  topicID,
  comment,
  solution,
}: {
  projectID: string
  meetingID: string
  topicID: string
  comment: CommentType
  solution?: boolean
}) {
  const { user, axios, commentListQueryKey, topicInfoQueryKey } = useAuth()

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editContent, setEditContent] = useState("")

  const queryClient = useQueryClient()
  const deleteCommentMutation = useMutation<BackendResponse, AxiosError>({
    mutationKey: [{ commentID: comment.ID }, "delete-mut"],
    mutationFn: async () =>
      (
        await axios!.delete(
          `/project/${projectID}/meeting/${meetingID}/topic/${topicID}/comment/${comment.ID}`,
        )
      ).data,
    onSuccess() {
      toast(`Comment #${comment.ID} deleted!`, { type: "success" })
      queryClient.invalidateQueries(
        commentListQueryKey!(projectID, meetingID, topicID),
      )
    },
    onError(err) {
      toast(
        <>
          <strong>Failed to delete comment</strong>
          <pre>{extractErrorMessage(err)}</pre>
        </>,
        { type: "error" },
      )
    },
  })

  const editCommentMutation = useMutation<BackendResponse, AxiosError, string>({
    mutationKey: [{ commentID: comment.ID }, "edit-mut"],
    mutationFn: async (content: string) =>
      (
        await axios!.put(
          `/project/${projectID}/meeting/${meetingID}/topic/${topicID}/comment/${comment.ID}`,
          content,
        )
      ).data,
    onSuccess() {
      toast(`Comment #${comment.ID} edited!`, { type: "success" })
      queryClient.invalidateQueries(
        commentListQueryKey!(projectID, meetingID, topicID),
      )
      setEditMode(false)
    },
  })

  const markSolutionMutation = useMutation<
    BackendResponse,
    AxiosError,
    boolean
  >({
    mutationKey: [{ topicID }, "solution-mut"],
    mutationFn: async (solution: boolean) =>
      (
        await axios![solution ? "post" : "delete"](
          `/project/${projectID}/meeting/${meetingID}/topic/${topicID}/comment/${comment.ID}/solution`,
        )
      ).data,
    onSuccess() {
      toast(`Comment #${comment.ID} marked as solution!`, { type: "success" })
      queryClient.invalidateQueries(
        commentListQueryKey!(projectID, meetingID, topicID),
      )
      queryClient.invalidateQueries(
        topicInfoQueryKey!(projectID, meetingID, topicID),
      )
    },
  })

  const date = new Date(Date.parse(comment.CreatedAt))
  const wasEdited = comment.CreatedAt !== comment.UpdatedAt

  function onSolutionClick(solution: boolean) {
    markSolutionMutation.mutate(solution)
  }

  function editEnter() {
    setEditContent(comment.content)
    setEditMode(true)
  }

  function onDeleteClick() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setConfirmDelete(false)
    deleteCommentMutation.mutate()
  }

  return (
    <div
      id={`comment-${comment.ID}`}
      className={`flex ${
        solution ? "border-l-4 border-primary-600 pl-3 py-3" : ""
      } p-4`}
    >
      <div className="flex flex-col items-center space-y-4">
        <div>
          <UserAvatar height={256} width={256} userID={comment.author_id} />
        </div>
      </div>
      <div className="flex flex-col ml-4 w-full">
        <div className="flex space-x-4 items-center">
          {/* Author and date */}
          <div>
            <span className="font-semibold">
              <ResolveUserName userID={comment.author_id} />
            </span>
            <span className="text-neutral-500">
              - <RelativeDate date={date} />
            </span>
            {wasEdited && <span className="text-neutral-500"> (edited)</span>}
          </div>

          {/* Solution button */}
          <LoadingButton
            onClick={() => onSolutionClick(!solution)}
            className={`${solution ? "text-primary-500" : "text-neutral-400"}`}
            isLoading={markSolutionMutation.isLoading}
          >
            {solution ? (
              <div className="space-x-2 bg-primary-500 px-2 py-1 flex items-center text-primary-100 text-sm rounded-md">
                <BsCheckSquareFill />
                <span>Marked Solution</span>
              </div>
            ) : (
              <BsCheckSquare />
            )}
          </LoadingButton>

          {/* Edit button */}
          {user?.uid === comment.author_id && (
            <>
              {editMode ? (
                <div className="space-x-2 border border-primary-500 px-2 py-1 flex items-center">
                  <span>Edit:</span>
                  <LoadingButton
                    onClick={() => editCommentMutation.mutate(editContent)}
                    className="text-neutral-400"
                    isLoading={editCommentMutation.isLoading}
                  >
                    <BsCheck size="20px" />
                  </LoadingButton>
                  <button
                    onClick={() => setEditMode(false)}
                    className="text-neutral-400"
                  >
                    <BsX size="20px" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => editEnter()}
                  className="text-neutral-400"
                >
                  <BsPen />
                </button>
              )}

              <LoadingButton
                isLoading={deleteCommentMutation.isLoading}
                onClick={onDeleteClick}
              >
                {confirmDelete ? (
                  <div className="flex justify-center items-center text-red-500 space-x-2">
                    <span>Delete?</span>
                    <BsTrash />
                  </div>
                ) : (
                  <div className="text-neutral-400">
                    <BsTrash />
                  </div>
                )}
              </LoadingButton>
            </>
          )}
        </div>
        <div className="text-neutral-200 mt-2">
          {editMode ? (
            <textarea
              className="w-full bg-transparent border border-secondary-500 p-4"
              style={{ minHeight: "200px" }}
              defaultValue={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
          ) : (
            <RenderMarkdown className="w-full" markdown={comment.content} />
          )}
        </div>
      </div>
    </div>
  )
}
