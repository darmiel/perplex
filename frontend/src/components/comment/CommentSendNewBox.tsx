import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useState } from "react"
import { toast } from "react-toastify"

import { sendCommentMutVars } from "@/api/functions"
import { BackendResponse, CommentEntityType } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import Button from "@/components/ui/Button"
import { useAuth } from "@/contexts/AuthContext"

export default function CommentSendNewBox({
  projectID,
  commentType,
  commentEntityID,
  className = "",
}: {
  projectID: number
  commentType: CommentEntityType
  commentEntityID: number
  className?: string
}) {
  const [commentBoxText, setCommentBoxText] = useState("")

  const { commentSendMutFn, commentSendMutKey, commentListQueryKey } = useAuth()
  const queryClient = useQueryClient()

  const refreshComments = () =>
    queryClient.invalidateQueries(
      commentListQueryKey!(projectID, commentType, commentEntityID),
    )

  const sendCommentMutation = useMutation<
    BackendResponse<never>,
    AxiosError,
    sendCommentMutVars
  >({
    mutationKey: commentSendMutKey!(projectID, commentType, commentEntityID),
    mutationFn: commentSendMutFn!(projectID, commentType, commentEntityID),
    onSuccess: () => {
      setCommentBoxText("")
      refreshComments()
      toast("Comment sent!", { type: "success" })
    },
  })

  return (
    <div className={`relative ${className}`}>
      <textarea
        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700"
        placeholder="Write a comment..."
        rows={4}
        onChange={(e) => setCommentBoxText(e.target.value)}
        value={commentBoxText}
      ></textarea>
      <div className="absolute bottom-6 right-4 flex flex-row justify-center items-center">
        {/* Show error message above the textbox */}
        {sendCommentMutation.isError && (
          <div className="text-red-500 mr-4">
            <pre>{extractErrorMessage(sendCommentMutation.error)}</pre>
          </div>
        )}
        {/* Show success message above the textbox */}
        {sendCommentMutation.isSuccess && (
          <div className="text-green-500 mr-4">Comment sent!</div>
        )}
        {/* Show loading message above the textbox */}
        {sendCommentMutation.isLoading && (
          <div className="text-gray-500 mr-4">Sending comment...</div>
        )}
        <div>
          <Button
            style="primary"
            isLoading={sendCommentMutation.isLoading}
            onClick={() =>
              sendCommentMutation.mutate({ comment: commentBoxText })
            }
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}
