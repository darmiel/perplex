import Link from "next/link"
import { BiSolidErrorCircle } from "react-icons/bi"
import CheckBoxCard from "../controls/card/CheckBoxCard"
import { act } from "react-dom/test-utils"
import { useAuth } from "@/contexts/AuthContext"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"

const classNames = {
  active: "border-neutral-500 bg-neutral-800 hover:bg-neutral-700",
  inactive:
    "border-neutral-600 cursor-pointer bg-neutral-900 hover:bg-neutral-800",
}

export default function TopicCard({
  title,
  description,
  projectID,
  meetingID,
  topicID,
  active,
  checked,
  className = "",
}: {
  title: string
  description: string
  projectID: string
  meetingID: string
  topicID: string
  active?: boolean
  checked: boolean
  className?: string
}) {
  const { axios } = useAuth()
  const queryClient = useQueryClient()

  const toggleTopicMutation = useMutation({
    mutationFn: async (check: boolean) =>
      (
        await axios![check ? "post" : "delete"](
          `/project/${projectID}/meeting/${meetingID}/topic/${topicID}/status`,
        )
      ).data,
    onSuccess: () => {
      queryClient.invalidateQueries([{ projectID }, { meetingID }, "topics"], {
        exact: true,
      })
      queryClient.invalidateQueries(
        [{ projectID }, { meetingID }, { topicID }],
        { exact: true },
      )
    },
    onError: (error: unknown) => {
      toast(
        <>
          <strong>Cannot Mark Topic as Done:</strong>
          <br />
          <pre>Solution missing.</pre>
        </>,
        { type: "error", position: "bottom-right" },
      )
    },
  })

  return (
    <Link
      href={`/project/${projectID}/meeting/${meetingID}/topic/${topicID}`}
      className={className}
    >
      <CheckBoxCard
        title={title}
        subtitle={description}
        active={active}
        checked={checked}
        truncateTitle={26}
        truncateSubTitle={36}
        onToggle={(toggled) => toggleTopicMutation.mutate(toggled)}
        disabled={toggleTopicMutation.isLoading}
        loading={toggleTopicMutation.isLoading}
        icon={
          toggleTopicMutation.isError ? (
            <BiSolidErrorCircle color="red" size="1.3em" />
          ) : undefined
        }
      />
    </Link>
  )
}
