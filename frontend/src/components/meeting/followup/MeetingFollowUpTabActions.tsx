import {
  Accordion,
  AccordionItem,
  Avatar,
  AvatarGroup,
  Chip,
  Link,
  ScrollShadow,
} from "@nextui-org/react"
import clsx from "clsx"
import { BsCheck, BsCheckAll, BsRecord2, BsTriangleFill } from "react-icons/bs"

import { Action, Meeting } from "@/api/types"
import Admonition from "@/components/ui/Admonition"
import Flex from "@/components/ui/layout/Flex"
import { TruncateTitle } from "@/components/ui/text/TruncateText"
import { useAuth } from "@/contexts/AuthContext"
import { getUserAvatarURL } from "@/util/avatar"
import { getActionURL } from "@/util/url"

export function MeetingFollowUpTabActions({
  openActions,
  closedActions,
}: {
  openActions: Action[]
  closedActions: Action[]
}) {
  return (
    <>
      {/* Action Follow Up Banner */}
      {openActions.length === 0 ? (
        <Admonition style="success" fullWidth>
          <BsCheckAll />
          <span>
            All actions that were assigned to a meeting topic have been closed.
          </span>
        </Admonition>
      ) : (
        <Admonition style="danger" fullWidth>
          <BsTriangleFill />
          <span>
            There are still open actions that were assigned to a meeting topic.
          </span>
        </Admonition>
      )}

      <div className="mt-2 flex items-start space-x-2">
        {/* Actions closed by last {date-selector} */}
        <Accordion defaultExpandedKeys={["closed"]}>
          <AccordionItem
            key="closed"
            title={
              <Flex gap={1} className="text-md">
                <BsCheckAll />
                <span className="font-semibold text-neutral-300">Finished</span>
                <Chip variant="faded" size="sm">
                  {closedActions.length}
                </Chip>
              </Flex>
            }
            isCompact
          >
            <MeetingFollowUpActionList actions={closedActions} />
          </AccordionItem>
        </Accordion>

        {/* Actions still open */}
        <Accordion defaultExpandedKeys={["open"]}>
          <AccordionItem
            key="open"
            title={
              <Flex gap={1} className="text-md">
                <BsRecord2 />
                <span className="font-semibold text-neutral-300">
                  Still Open
                </span>
                <Chip variant="faded" size="sm">
                  {openActions.length}
                </Chip>
              </Flex>
            }
            isCompact
          >
            <MeetingFollowUpActionList actions={openActions} />
          </AccordionItem>
        </Accordion>
      </div>
    </>
  )
}

export function MeetingFollowUpTabActionsWrapper({
  meeting,
}: {
  meeting: Meeting
}) {
  const { actions } = useAuth()

  const actionListQuery = actions!.useListForMeeting(
    meeting.project_id,
    meeting.ID,
  )

  if (actionListQuery.isLoading) {
    return <span>Loading Actions...</span>
  }

  const actionsList: Action[] = actionListQuery.data?.data || []
  if (actionsList.length === 0) {
    return (
      <Flex col>
        <h2 className="text-lg font-semibold">No Actions</h2>
        <span>No actions found that were assigned to a meeting topic</span>
      </Flex>
    )
  }

  const actionListOpen = actionsList
    .filter((action) => !action.closed_at.Valid)
    .sort((a, b) => a.ID - b.ID)

  const actionListClosed = actionsList
    .filter((action) => action.closed_at.Valid)
    .sort((a, b) => a.ID - b.ID)

  return (
    <>
      <MeetingFollowUpTabActions
        openActions={actionListOpen}
        closedActions={actionListClosed}
      />
    </>
  )
}

function MeetingFollowUpActionList({ actions }: { actions: Action[] }) {
  return (
    <ScrollShadow className="max-h-80">
      {actions.map((action) => (
        <Link
          className={clsx(
            "flex items-center justify-between rounded-md border border-transparent p-2 transition duration-150 ease-in-out",
            "hover:cursor-pointer hover:border-neutral-800 hover:bg-neutral-900",
          )}
          key={action.ID}
          href={getActionURL(action.project_id, action.ID)}
        >
          <div className="flex flex-col">
            <Flex gap={2}>
              <span
                className={clsx("text-2xl", {
                  "text-neutral-500": action.closed_at.Valid,
                  "text-red-500": !action.closed_at.Valid,
                })}
              >
                {action.closed_at.Valid ? <BsCheck /> : <BsRecord2 />}
              </span>
              <TruncateTitle truncate={20} className="truncate">
                {action.title}
              </TruncateTitle>
              <span className="text-neutral-500">#{action.ID}</span>
            </Flex>

            {/* Action Actions */}
            <Flex gap={2} className="mt-4">
              <AvatarGroup max={3} size="sm">
                {action.assigned_users.map((user) => (
                  <Avatar key={user.id} src={getUserAvatarURL(user.id)} />
                ))}
              </AvatarGroup>
              <ScrollShadow
                orientation="horizontal"
                hideScrollBar
                className="max-w-xs"
              >
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
                    <span className="text-sm italic text-default-400">
                      No Tags
                    </span>
                  )}
                </Flex>
              </ScrollShadow>
            </Flex>
          </div>
        </Link>
      ))}
    </ScrollShadow>
  )
}
