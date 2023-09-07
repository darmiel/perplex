import { Avatar, AvatarGroup, Chip, ScrollShadow } from "@nextui-org/react"
import Link from "next/link"

import { Action } from "@/api/types"
import ResolveProjectName from "@/components/resolve/ResolveProjectName"
import DurationTag from "@/components/ui/DurationTag"
import Hr from "@/components/ui/Hr"
import Flex from "@/components/ui/layout/Flex"
import { getUserAvatarURL } from "@/components/user/UserAvatar"

export default function ActionCardLarge({
  action,
  onClick,
}: {
  action: Action
  onClick: () => void
}) {
  const actionDueDate = action.due_date.Valid
    ? new Date(action.due_date.Time)
    : null

  const actionDueDateStr =
    actionDueDate !== null
      ? actionDueDate.toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : undefined
  const isClosed = action.closed_at.Valid
  return (
    <div className="flex w-full flex-col space-y-2 rounded-lg border border-neutral-800 px-5 py-4 transition-colors hover:border-neutral-700 hover:bg-neutral-800/30">
      <div>
        {/* Project Header */}
        <Link
          className="text-default-400 flex items-center gap-2"
          href={`/project/${action.project_id}`}
        >
          <ResolveProjectName projectID={action.project_id} />
        </Link>

        {/* Action Title */}
        <button onClick={() => onClick()} className="flex gap-2">
          {/* Action Status */}
          {isClosed ? (
            <Chip variant="flat" color="danger">
              Closed
            </Chip>
          ) : (
            <Chip variant="flat" color="success">
              Open
            </Chip>
          )}
          <h1 className="text-lg font-semibold">{action.title}</h1>
        </button>
      </div>

      <p className="flex items-center gap-2 text-neutral-400">
        {actionDueDate && actionDueDateStr ? (
          <>
            {actionDueDateStr}
            <DurationTag date={actionDueDate} />
          </>
        ) : (
          <span className="text-default-400 italic">No Due Date</span>
        )}
      </p>

      <Hr />

      {/* Action Actions */}
      <Flex justify="between" gap={2} className="mt-4">
        <ScrollShadow orientation="horizontal" hideScrollBar>
          <Flex gap={1}>
            {action.tags?.length > 0 ? (
              action.tags.map((tag) => (
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
          {action.assigned_users.map((user) => (
            <Avatar key={user.id} src={getUserAvatarURL(user.id)} />
          ))}
        </AvatarGroup>
      </Flex>
    </div>
  )
}
