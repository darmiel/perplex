import { Textarea } from "@nextui-org/react"
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

  const error = extractErrorMessage(sendCommentMutation.error)
  const isError = error && error !== "null"

  return (
    <div className={`relative ${className}`}>
      <Textarea
        minRows={4}
        maxRows={25}
        label="Write a comment"
        value={commentBoxText}
        onValueChange={setCommentBoxText}
        onKeyDown={(e) => {
          if (
            e.key === "Enter" &&
            e.getModifierState("Meta") &&
            !e.getModifierState("Shift")
          ) {
            send()
          }
        }}
        variant="bordered"
        description="Markdown is supported"
        errorMessage={isError ? error : undefined}
        color={isError ? "danger" : "default"}
      />

      <div className="absolute bottom-9 right-4 flex flex-row items-center justify-center">
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
  )
}
