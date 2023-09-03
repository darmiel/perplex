import { useState } from "react"
import { toast } from "sonner"

import { CommentEntityType } from "@/api/types"
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

  const { comments: comment } = useAuth()

  const sendCommentMutation = comment!.useSend(
    projectID,
    commentType,
    commentEntityID,
    () => {
      setCommentBoxText("")
      toast.success("Comment sent!")
    },
  )

  function send() {
    if (sendCommentMutation.isLoading) {
      return
    }
    sendCommentMutation.mutate({ comment: commentBoxText })
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (
      e.key === "Enter" &&
      e.getModifierState("Meta") &&
      !e.getModifierState("Shift")
    ) {
      send()
    }
  }

  return (
    <div className={`relative ${className}`}>
      <textarea
        className="w-full border border-neutral-700 bg-neutral-900 px-3 py-2"
        placeholder="Write a comment..."
        rows={4}
        onChange={(e) => setCommentBoxText(e.target.value)}
        value={commentBoxText}
        onKeyDown={onKeyDown}
      ></textarea>

      <div className="absolute bottom-6 right-4 flex flex-row items-center justify-center">
        {/* Show error message above the textbox */}
        {sendCommentMutation.isError && (
          <div className="mr-4 text-red-500">
            <pre>{extractErrorMessage(sendCommentMutation.error)}</pre>
          </div>
        )}
        {/* Show success message above the textbox */}
        {sendCommentMutation.isSuccess && (
          <div className="mr-4 text-green-500">Comment sent!</div>
        )}
        {/* Show loading message above the textbox */}
        {sendCommentMutation.isLoading && (
          <div className="mr-4 text-gray-500">Sending comment...</div>
        )}
        <div>
          <Button
            style="primary"
            isLoading={sendCommentMutation.isLoading}
            onClick={() => send()}
            icon={
              <span className="rounded-md bg-neutral-800 px-2 py-1">
                ⌘ + Enter
              </span>
            }
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}
