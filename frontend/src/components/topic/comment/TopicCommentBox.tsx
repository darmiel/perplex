import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "react-toastify"

import { BackendResponse } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import Button from "@/components/controls/Button"
import { useAuth } from "@/contexts/AuthContext"

export default function TopicCommentBox({
  projectID,
  meetingID,
  topicID,
}: {
  projectID: string
  meetingID: string
  topicID: string
}) {
  const [commentBoxText, setCommentBoxText] = useState("")

  const { axios } = useAuth()
  const queryClient = useQueryClient()

  const sendCommentMutation = useMutation<BackendResponse<never>>({
    mutationKey: [{ projectID }, { meetingID }, { topicID }, "comments-send"],
    mutationFn: async () =>
      (
        await axios!.post(
          `/project/${projectID}/meeting/${meetingID}/topic/${topicID}/comment`,
          commentBoxText,
        )
      ).data,
    onSuccess: () => {
      setCommentBoxText("")

      // invalidate the comment list query to refetch the comments
      queryClient.invalidateQueries([
        { projectID },
        { meetingID },
        { topicID },
        "comments",
      ])

      toast("Comment sent!", { type: "success" })
    },
  })

  return (
    <div className="relative mt-4 border-t border-gray-700">
      <textarea
        className="mt-8 w-full px-3 py-2 bg-neutral-900 border border-neutral-700"
        placeholder="Write a comment..."
        rows={8}
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
            onClick={() => sendCommentMutation.mutate()}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}
