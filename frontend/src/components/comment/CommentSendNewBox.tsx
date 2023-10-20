import { Button, Kbd, Textarea } from "@nextui-org/react"
import { useState } from "react"
import { toast } from "sonner"

import { Comment, CommentEntityType } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import { useAuth } from "@/contexts/AuthContext"

export default function CommentSendNewBox({
  projectID,
  commentType,
  commentEntityID,
  className = "",
  onShiftSend,
}: {
  projectID: number
  commentType: CommentEntityType
  commentEntityID: number
  className?: string
  onShiftSend?: (comment: Comment) => void
}) {
  const [commentBoxText, setCommentBoxText] = useState("")

  const { comments: comment } = useAuth()

  const sendCommentMutation = comment!.useSend(
    projectID,
    commentType,
    commentEntityID,
    ({ data }, { __shift }) => {
      setCommentBoxText("")
      toast.success(`Comment sent! (#${data.ID})`)
      if (__shift) {
        onShiftSend?.(data)
      }
    },
  )

  function send(shift: boolean) {
    if (sendCommentMutation.isLoading) {
      return
    }
    sendCommentMutation.mutate({ comment: commentBoxText, __shift: shift })
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
          if (e.key === "Enter" && e.getModifierState("Meta")) {
            send(e.getModifierState("Shift"))
          }
        }}
        variant="bordered"
        description="Markdown is supported"
        errorMessage={isError ? error : undefined}
        color={isError ? "danger" : "default"}
      />

      <div className="absolute bottom-9 right-4 flex flex-row items-center justify-center">
        <Button
          color="primary"
          isLoading={sendCommentMutation.isLoading}
          onClick={() => send(false)}
          startContent={<Kbd keys={["command", "enter"]} />}
        >
          Send
        </Button>
      </div>
    </div>
  )
}
