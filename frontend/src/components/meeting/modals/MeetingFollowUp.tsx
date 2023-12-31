/*
 * Closed Topics from last meeting
 * Open Topics from last meeting
 * Closed Actions from last meeting
 * Open Actions from last meeting
 */

import {
  Accordion,
  AccordionItem,
  Avatar,
  AvatarGroup,
  Button,
  Chip,
  Input,
  ScrollShadow,
  Select,
  SelectItem,
  Tab,
  Tabs,
} from "@nextui-org/react"
import clsx from "clsx"
import { useState } from "react"
import {
  BsActivity,
  BsArchive,
  BsChat,
  BsCheck,
  BsCheckAll,
  BsCircle,
  BsGear,
  BsPlay,
  BsRecord2,
  BsRewind,
  BsSearch,
  BsSkipBackward,
} from "react-icons/bs"

import { Action, Meeting } from "@/api/types"
import { extractErrorMessage, includesFold } from "@/api/util"
import ActionPeekModal from "@/components/action/modals/ActionItemPeek"
import MeetingChip from "@/components/meeting/chips/MeetingChips"
import { getMeetingTenseByMeeting } from "@/components/meeting/MeetingTag"
import Hr from "@/components/ui/Hr"
import Flex from "@/components/ui/layout/Flex"
import ModalContainerNG from "@/components/ui/modal/ModalContainerNG"
import ModalPopup from "@/components/ui/modal/ModalPopup"
import { TruncateTitle } from "@/components/ui/text/TruncateText"
import { useAuth } from "@/contexts/AuthContext"
import { useFollowUp } from "@/contexts/FollowUp"
import { getUserAvatarURL } from "@/util/avatar"

export function MeetingFollowUpMeetingSelection({
  projectID,
  onClose,
  onSelect,
}: {
  projectID: number
  onClose: () => void
  onSelect: (meeting: Meeting) => void
}) {
  const [filter, setFilter] = useState("")

  const { meetings } = useAuth()

  const listMeetingsQuery = meetings!.useList(projectID)
  if (listMeetingsQuery.isLoading) {
    return <div>Loading...</div>
  }
  if (listMeetingsQuery.isError) {
    return <div>Error: {extractErrorMessage(listMeetingsQuery.error)}</div>
  }

  const doFilter = (custom: (meeting: Meeting) => boolean) =>
    listMeetingsQuery.data.data
      .filter(custom)
      .filter((meeting) => !filter || includesFold(meeting.name, filter))
      .map((meeting) => (
        <Flex
          key={meeting.ID}
          className={clsx(
            "rounded-md border border-transparent p-2 transition duration-150 ease-in-out",
            "hover:cursor-pointer hover:border-neutral-800 hover:bg-neutral-900",
          )}
          gap={2}
          onClick={() => onSelect(meeting)}
        >
          <MeetingChip meeting={meeting} />
          <span>{meeting.name}</span>
        </Flex>
      ))

  const pastMeetings = doFilter(
    (meeting) => getMeetingTenseByMeeting(meeting) === "past",
  )
  const otherMeetings = doFilter(
    (meeting) => getMeetingTenseByMeeting(meeting) !== "past",
  )

  return (
    <ModalContainerNG title="Select Meeting to Follow Up" onClose={onClose}>
      <Input
        variant="bordered"
        value={filter}
        onValueChange={setFilter}
        startContent={<BsSearch />}
        placeholder={`Search in Meetings...`}
        width="100%"
      />

      <Hr />

      <ScrollShadow className="max-h-96">
        <Accordion defaultExpandedKeys={["past"]}>
          <AccordionItem
            title={
              <Flex>
                Past Meetings{" "}
                <Chip variant="faded" size="sm">
                  {pastMeetings.length}
                </Chip>
              </Flex>
            }
            key="past"
            startContent={<BsRewind />}
          >
            {pastMeetings}
          </AccordionItem>
          <AccordionItem
            title={
              <Flex>
                Other Meetings{" "}
                <Chip variant="faded" size="sm">
                  {otherMeetings.length}
                </Chip>
              </Flex>
            }
            key="other"
            startContent={<BsCircle />}
          >
            {otherMeetings}
          </AccordionItem>
        </Accordion>
      </ScrollShadow>
    </ModalContainerNG>
  )
}

function MeetingFollowUpActionList({
  actions,
  onActionClick,
}: {
  actions: Action[]
  onActionClick: (action: Action) => void
}) {
  return (
    <ScrollShadow className="max-h-80">
      {actions.map((action) => (
        <div
          className={clsx(
            "flex items-center justify-between rounded-md border border-transparent p-2 transition duration-150 ease-in-out",
            "hover:cursor-pointer hover:border-neutral-800 hover:bg-neutral-900",
          )}
          key={action.ID}
          onClick={() => onActionClick(action)}
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
        </div>
      ))}
    </ScrollShadow>
  )
}

export function MeetingFollowUpOverview({
  meeting,
  onClose,
  onBack,
  onStop,
}: {
  meeting: Meeting
  onClose: () => void
  onBack?: () => void
  onStop?: () => void
}) {
  const [dateSelector, setDateSelector] = useState("after-end")

  const [showActionPeek, setShowActionPeek] = useState(false)
  const [actionPeekItem, setActionPeekItem] = useState<Action | null>(null)

  const { actions, topics } = useAuth()

  const actionListQuery = actions!.useListForMeeting(
    meeting.project_id,
    meeting.ID,
  )

  const topicListQuery = topics!.useList(meeting.project_id, meeting.ID)

  const actionListOpen =
    actionListQuery.data?.data
      .filter((action) => !action.closed_at.Valid)
      // sort by ID
      .sort((a, b) => a.ID - b.ID) || []
  const actionListClosed =
    actionListQuery.data?.data
      .filter((action) => action.closed_at.Valid)
      .sort((a, b) => a.ID - b.ID) || []

  // actions tab
  // topics tab
  // solution comments
  return (
    <ModalContainerNG
      className="w-[80rem]"
      title={`Follow Up ${meeting.name}`}
      onClose={onClose}
      endContent={
        <Flex gap={2}>
          {onBack && (
            <Button size="sm" onClick={onBack}>
              Back
            </Button>
          )}
          {onStop && (
            <Button size="sm" onClick={onStop} startContent={<BsCheck />}>
              Finish Follow-Up
            </Button>
          )}
        </Flex>
      }
    >
      {/* Advanced Options */}
      <Accordion className="rounded-md bg-neutral-800 p-2">
        <AccordionItem
          key="advanced"
          title={
            <Flex gap={2}>
              <BsGear />
              <span className="text-sm font-semibold text-neutral-300">
                More Options
              </span>
            </Flex>
          }
          isCompact
        >
          <Select
            variant="bordered"
            // className="w-40"
            label="Entity Date Selector"
            size="sm"
            labelPlacement="outside-left"
            disallowEmptySelection
            defaultSelectedKeys={["after-end"]}
            onSelectionChange={(item) =>
              item !== "all" &&
              item.forEach((val) => setDateSelector(val.toString()))
            }
          >
            <SelectItem key="after-end" startContent={<BsPlay />}>
              After Meeting Ended
            </SelectItem>
            <SelectItem key="after-start" startContent={<BsSkipBackward />}>
              After Meeting Started
            </SelectItem>
          </Select>
        </AccordionItem>
      </Accordion>
      <Tabs
        fullWidth
        size="md"
        variant="bordered"
        color="primary"
        disabledKeys={["topics", "comments"]}
      >
        <Tab
          key="actions"
          title={
            <Flex gap={2} justify="start">
              <BsActivity />
              Actions
              <Chip variant="faded" size="sm">
                {actionListQuery.data?.data.length || 0}
              </Chip>
            </Flex>
          }
        >
          <div className="flex">
            {/* Actions closed by last {date-selector} */}
            <Accordion defaultExpandedKeys={["closed"]}>
              <AccordionItem
                key="closed"
                title={
                  <Flex gap={1} className="text-md">
                    <BsCheckAll />
                    <span className="font-semibold text-neutral-300">
                      Finished
                    </span>
                    <Chip variant="faded" size="sm">
                      {actionListClosed.length}
                    </Chip>
                  </Flex>
                }
                isCompact
              >
                <MeetingFollowUpActionList
                  actions={actionListClosed}
                  onActionClick={(action) => {
                    setActionPeekItem(action)
                    setShowActionPeek(true)
                  }}
                />
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
                      {actionListOpen.length}
                    </Chip>
                  </Flex>
                }
                isCompact
              >
                <MeetingFollowUpActionList
                  actions={actionListOpen}
                  onActionClick={(action) => {
                    setActionPeekItem(action)
                    setShowActionPeek(true)
                  }}
                />
              </AccordionItem>
            </Accordion>
          </div>
        </Tab>
        <Tab
          key="topics"
          title={
            <Flex gap={2} justify="start">
              <BsArchive />
              Topics
              <Chip variant="faded" size="sm">
                {topicListQuery.data?.data.length || 0}
              </Chip>
            </Flex>
          }
        >
          Coming soon.
        </Tab>
        <Tab
          key="comments"
          title={
            <Flex gap={2} justify="start">
              <BsChat />
              Comments
              <Chip variant="faded" size="sm">
                NaN
              </Chip>
            </Flex>
          }
        >
          Coming soon.
        </Tab>
      </Tabs>
      <ModalPopup
        open={showActionPeek && !!actionPeekItem}
        setOpen={setShowActionPeek}
      >
        <ActionPeekModal
          action={actionPeekItem!}
          onClose={() => {
            setShowActionPeek(false)
          }}
        />
      </ModalPopup>
    </ModalContainerNG>
  )
}

export default function MeetingFollowUp({
  projectID,
  onClose,
}: {
  projectID: number
  onClose: () => void
}) {
  const [meeting, setMeeting] = useState<Meeting | undefined>(undefined)
  const { setFollowUp } = useFollowUp()

  return meeting ? (
    <MeetingFollowUpOverview
      meeting={meeting}
      onClose={onClose}
      onBack={() => setMeeting(undefined)}
      onStop={() => setFollowUp("")}
    />
  ) : (
    <MeetingFollowUpMeetingSelection
      projectID={projectID}
      onClose={onClose}
      onSelect={(newMeeting) => {
        setFollowUp(JSON.stringify(newMeeting))
        setMeeting(newMeeting)
      }}
    />
  )
}
