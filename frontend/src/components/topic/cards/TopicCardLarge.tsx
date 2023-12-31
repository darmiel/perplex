import {
  Avatar,
  AvatarGroup,
  Checkbox,
  Chip,
  ScrollShadow,
} from "@nextui-org/react"
import clsx from "clsx"
import Link from "next/link"
import { BsCheck } from "react-icons/bs"

import { Topic } from "@/api/types"
import ResolveMeetingName from "@/components/resolve/ResolveMeetingName"
import Hr from "@/components/ui/Hr"
import Flex from "@/components/ui/layout/Flex"
import { useAuth } from "@/contexts/AuthContext"
import { getUserAvatarURL } from "@/util/avatar"

export default function TopicCardLarge({
  projectID,
  topic,
  hideMeetingName,
  checkable,
  compact,
  className = "w-full",
}: {
  projectID: number
  topic: Topic
  hideMeetingName?: boolean
  checkable?: boolean
  compact?: boolean
  className?: string
}) {
  const isClosed = topic.closed_at.Valid

  const { user, topics } = useAuth()
  const toggleTopicMutation = topics!.useStatus(
    projectID,
    topic.meeting_id,
    () => {},
  )

  const displayFooter =
    !compact || topic.tags?.length > 0 || topic.assigned_users?.length > 0

  return (
    <div
      className={clsx(
        "flex flex-col justify-between space-y-2 rounded-lg border border-neutral-800 px-5 py-4",
        "transition-colors hover:border-neutral-700 hover:bg-neutral-800/30",
        className,
        {
          "border-r-4 border-r-primary-500": topic.assigned_users.some(
            (u) => u.id === user?.uid,
          ),
        },
      )}
    >
      <div>
        {/* Project Header */}
        {!hideMeetingName && (
          <Link
            className="flex items-center gap-2 text-default-400"
            href={`/project/${projectID}/meeting/${topic.meeting_id}`}
          >
            <span className="truncate">
              <ResolveMeetingName
                projectID={projectID}
                meetingID={topic.meeting_id}
              />
            </span>
          </Link>
        )}

        {/* Topic Title */}
        <Link
          href={`/project/${projectID}/meeting/${topic.meeting_id}/topic/${topic.ID}`}
          className="flex items-center space-x-2"
        >
          {/* Action Status */}
          {checkable ? (
            <Checkbox
              isIndeterminate={toggleTopicMutation.isLoading}
              isSelected={topic.closed_at.Valid}
              onValueChange={(checked) => {
                toggleTopicMutation.mutate({
                  topicID: topic.ID,
                  close: checked,
                })
              }}
            />
          ) : (
            <span className="inline-flex items-baseline">
              <Chip
                size="sm"
                variant={isClosed ? "faded" : "shadow"}
                color={isClosed ? "success" : "danger"}
              >
                {isClosed ? "Closed" : "Open"}
              </Chip>
            </span>
          )}
          {/* Solution Tag */}
          {!!topic.solution_id && (
            <span className="text-primary-500">
              <BsCheck />
            </span>
          )}
          <span className="truncate text-start text-lg font-medium">
            {topic.title}
          </span>
        </Link>
      </div>

      {displayFooter && (
        <>
          <Hr />

          {/* Action Actions */}
          <Flex justify="between" gap={2} className="mt-4">
            <ScrollShadow orientation="horizontal" hideScrollBar>
              <Flex gap={1}>
                {topic.tags?.length > 0 ? (
                  topic.tags.map((tag) => (
                    <Chip
                      key={tag.ID}
                      className="whitespace-nowrap"
                      variant="bordered"
                      style={{
                        borderColor: tag.color,
                      }}
                    >
                      {tag.title}
                    </Chip>
                  ))
                ) : (
                  <span className="text-sm italic text-default-400">
                    No Tags
                  </span>
                )}
              </Flex>
            </ScrollShadow>
            <AvatarGroup max={3} size="sm">
              {topic.assigned_users.map((user) => (
                <Avatar key={user.id} src={getUserAvatarURL(user.id)} />
              ))}
            </AvatarGroup>
          </Flex>
        </>
      )}
    </div>
  )
}
