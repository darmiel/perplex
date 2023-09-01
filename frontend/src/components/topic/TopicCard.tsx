import Link from "next/link"
import { BiSolidErrorCircle } from "react-icons/bi"
import { BsCheck, BsCheckCircleFill } from "react-icons/bs"

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
  disabled,
  className = "",
}: {
  topic: Topic
  projectID: number
  meetingID: number
  active?: boolean
  disabled?: boolean
  className?: string
}) {
  const { topics } = useAuth()
  const toggleTopicMutation = topics!.useStatus(projectID, meetingID, () => {})

  const checked = topic.closed_at.Valid
  const isAssigned =
    topic.assigned_users?.some((user) => user.id === user?.id) ?? false

  return (
    <Link
      href={`/project/${projectID}/meeting/${meetingID}/topic/${topic.ID}`}
      className={className}
    >
      <CheckableCardContainer
        disabled={disabled}
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
        onToggle={(toggled) =>
          toggleTopicMutation.mutate({
            close: toggled,
            topicID: topic.ID,
          })
        }
        className={isAssigned ? "border-r-4 border-r-primary-500" : ""}
      >
        <div className="flex flex-col">
          <div className="flex flex-row items-center space-x-2">
            {!!topic.solution_id && (
              <div className="text-primary-500">
                <BsCheck />
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
            {topic.description || <em>No description</em>}
          </TruncateSubTitle>
        </div>
      </CheckableCardContainer>
    </Link>
  )
}
