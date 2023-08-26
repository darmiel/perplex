import { useMutation, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { BiSolidErrorCircle } from "react-icons/bi"
import { BsCheckCircleFill, BsCheckSquareFill } from "react-icons/bs"
import { toast } from "react-toastify"

import { Topic } from "@/api/types"
import { CheckableCardContainer } from "@/components/ui/card/CheckableCardContainer"
import {
  TruncateSubTitle,
  TruncateTitle,
} from "@/components/ui/text/TruncateText"
import { useAuth } from "@/contexts/AuthContext"

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
  const { topicStatusMutFn, topicStatusMutKey } = useAuth()
  const queryClient = useQueryClient()

  const toggleTopicMutation = useMutation({
    mutationKey: topicStatusMutKey!(projectID, meetingID, topic.ID),
    mutationFn: topicStatusMutFn!(projectID, meetingID, topic.ID),
    onSuccess: () => {
      queryClient.invalidateQueries([{ projectID }, { meetingID }, "topics"])
      queryClient.invalidateQueries([
        { projectID },
        { meetingID },
        { topicID: String(topic.ID) },
      ])
    },
    onError: () => {
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
      <CheckableCardContainer
        checked={checked}
        style={active ? "selected-border" : "neutral"}
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
        onToggle={(toggled) => toggleTopicMutation.mutate(toggled)}
        className={isAssigned ? "border-r-4 border-r-primary-500" : ""}
      >
        <div className="flex flex-col">
          <div className="flex flex-row items-center space-x-2">
            {!!topic.solution_id && (
              <div className="text-primary-500">
                <BsCheckSquareFill />
              </div>
            )}
            <div>
              <TruncateTitle
                truncate={!!topic.solution_id ? 20 : 26}
                active={!checked}
              >
                {topic.title}
              </TruncateTitle>
            </div>
          </div>
          <TruncateSubTitle truncate={36} active={!checked}>
            {topic.description}
          </TruncateSubTitle>
        </div>
      </CheckableCardContainer>
    </Link>
  )
}
