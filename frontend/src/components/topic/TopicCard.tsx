import { useMutation, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { BiSolidErrorCircle } from "react-icons/bi"
import { BsCheckCircleFill } from "react-icons/bs"
import { toast } from "react-toastify"

import { SimpleCheckBoxCard } from "@/components/controls/card/CheckBoxCard"
import { useAuth } from "@/contexts/AuthContext"

import { CardSubTitle, CardTitle } from "../controls/card/SimpleCard"
import { Topic } from "./TopicList"

const classNames = {
  active: "border-neutral-500 bg-neutral-800 hover:bg-neutral-700",
  inactive:
    "border-neutral-600 cursor-pointer bg-neutral-900 hover:bg-neutral-800",
}

export default function TopicCard({
  topic,
  projectID,
  meetingID,
  active,
  className = "",
}: {
  topic: Topic
  projectID: string
  meetingID: string
  active?: boolean
  className?: string
}) {
  const { axios, user } = useAuth()
  const queryClient = useQueryClient()

  const toggleTopicMutation = useMutation({
    mutationFn: async (check: boolean) =>
      (
        await axios![check ? "post" : "delete"](
          `/project/${projectID}/meeting/${meetingID}/topic/${topic.ID}/status`,
        )
      ).data,
    onSuccess: () => {
      queryClient.invalidateQueries([{ projectID }, { meetingID }, "topics"])
    },
    onError: (error: unknown) => {
      toast(
        <>
          <strong>Cannot Mark Topic as Done:</strong>
          <br />
          <pre>Solution missing.</pre>
        </>,
        { type: "error" },
      )
    },
  })

  const checked = topic.closed_at.Valid
  const isAssigned = topic.assigned_users.some((user) => user.id === user?.id)

  return (
    <Link
      href={`/project/${projectID}/meeting/${meetingID}/topic/${topic.ID}`}
      className={className}
    >
      <SimpleCheckBoxCard
        className={isAssigned ? "border-r-4 border-r-orange-500" : ""}
        active={active}
        checked={checked}
        onToggle={(toggled) => toggleTopicMutation.mutate(toggled)}
        disabled={toggleTopicMutation.isLoading}
        loading={toggleTopicMutation.isLoading}
        overwriteIcon={
          toggleTopicMutation.isError && (
            <BiSolidErrorCircle color="red" size="1.3em" />
          )
        }
        checkedIcon={
          <BsCheckCircleFill
            color={topic.solution_id ? "lime" : "gray"}
            size="1.3em"
          />
        }
      >
        <div className="flex flex-col">
          <CardTitle truncate={26} active={!checked}>
            {topic.title}
          </CardTitle>
          <CardSubTitle truncate={36} active={!checked}>
            {topic.description}
          </CardSubTitle>
        </div>
      </SimpleCheckBoxCard>
    </Link>
  )
}
