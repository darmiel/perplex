import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import Link from "next/link"
import { toast } from "react-toastify"

import { Action, BackendResponse } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import Removable from "@/components/ui/Removable"
import { TruncateTitle } from "@/components/ui/text/TruncateText"
import { useAuth } from "@/contexts/AuthContext"

export default function ActionSectionTopics({ action }: { action: Action }) {
  const { axios } = useAuth()
  const queryClient = useQueryClient()

  const linkTopicMut = useMutation<
    BackendResponse,
    AxiosError,
    { link: boolean; topicID: number }
  >({
    mutationKey: [{ actionID: String(action.ID) }, "link-topic-mut"],
    mutationFn: async ({ link, topicID }) =>
      (
        await axios![link ? "post" : "delete"](
          `/project/${action.project_id}/action/${action.ID}/topic/${topicID}`,
        )
      ).data,
    onSuccess: () => {
      queryClient.invalidateQueries([{ actionID: String(action.ID) }])
    },
    onError: (error, { link }) => {
      toast(
        <>
          <strong>Cannot {link ? "link" : "unlink"} Topic:</strong>
          <pre>{extractErrorMessage(error)}</pre>
        </>,
        { type: "error" },
      )
    },
  })

  return (
    <>
      <div className="flex flex-col space-y-2">
        {action.topics.map((topic) => (
          <Removable
            key={topic.ID}
            onRemove={() =>
              linkTopicMut.mutate({
                link: false,
                topicID: topic.ID,
              })
            }
            loading={linkTopicMut.isLoading}
          >
            <div className="w-full px-2 py-1 flex flex-row items-center space-x-2 space-y-1 border border-neutral-700 rounded-md">
              <div>
                <Link
                  href={`/project/${action.project_id}/meeting/${topic.meeting_id}`}
                  className="text-xs text-neutral-400 px-2 py-1 bg-neutral-700 rounded-md w-fit"
                >
                  #{topic.meeting_id}
                </Link>
              </div>
              <Link
                href={`/project/${action.project_id}/meeting/${topic.meeting_id}/topic/${topic.ID}`}
              >
                <TruncateTitle truncate={20} className="">
                  {topic.title}
                </TruncateTitle>
              </Link>
            </div>
          </Removable>
        ))}
      </div>
    </>
  )
}
