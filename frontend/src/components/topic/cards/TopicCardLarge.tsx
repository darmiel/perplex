import { Avatar, AvatarGroup, Chip, ScrollShadow } from "@nextui-org/react"
import Link from "next/link"

import { Topic } from "@/api/types"
import ResolveMeetingName from "@/components/resolve/ResolveMeetingName"
import Hr from "@/components/ui/Hr"
import Flex from "@/components/ui/layout/Flex"
import { getUserAvatarURL } from "@/components/user/UserAvatar"

export default function TopicCardLarge({
  projectID,
  topic,
}: {
  projectID: number
  topic: Topic
}) {
  const isClosed = topic.closed_at.Valid

  return (
    <div className="flex w-full flex-col justify-between space-y-2 rounded-lg border border-neutral-800 px-5 py-4 transition-colors hover:border-neutral-700 hover:bg-neutral-800/30">
      <div>
        {/* Project Header */}
        <Link
          className="text-default-400 flex items-center gap-2"
          href={`/project/${projectID}/meeting/${topic.meeting_id}`}
        >
          <ResolveMeetingName
            projectID={projectID}
            meetingID={topic.meeting_id}
          />
        </Link>

        {/* Action Title */}
        <Link
          href={`/project/${projectID}/meeting/${topic.meeting_id}/topic/${topic.ID}`}
        >
          <h1 className="block space-x-2 text-clip text-start text-lg font-medium">
            {/* Action Status */}
            {isClosed ? (
              <Chip variant="dot" color="success">
                Resolved
              </Chip>
            ) : (
              <Chip variant="dot" color="danger">
                Unresolved
              </Chip>
            )}
            <span>{topic.title}</span>
          </h1>
        </Link>
      </div>

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
              <span className="text-default-400 text-sm italic">No Tags</span>
            )}
          </Flex>
        </ScrollShadow>
        <AvatarGroup max={3} size="sm">
          {topic.assigned_users.map((user) => (
            <Avatar key={user.id} src={getUserAvatarURL(user.id)} />
          ))}
        </AvatarGroup>
      </Flex>
    </div>
  )
}
