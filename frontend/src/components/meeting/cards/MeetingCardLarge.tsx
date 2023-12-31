import {
  Avatar,
  AvatarGroup,
  Chip,
  Progress,
  ScrollShadow,
  Tooltip,
} from "@nextui-org/react"
import clsx from "clsx"
import Link from "next/link"
import { BsTriangleFill } from "react-icons/bs"

import { Meeting } from "@/api/types"
import MeetingChip from "@/components/meeting/chips/MeetingChips"
import { getMeetingTenseByMeeting } from "@/components/meeting/MeetingTag"
import ResolveProjectName from "@/components/resolve/ResolveProjectName"
import DurationTag from "@/components/ui/DurationTag"
import Hr from "@/components/ui/Hr"
import Flex from "@/components/ui/layout/Flex"
import GlowingModalCard from "@/components/ui/modal/GlowingModalCard"
import { getUserAvatarURL } from "@/util/avatar"

export default function MeetingCardLarge({ meeting }: { meeting: Meeting }) {
  const meetingStartDate = new Date(meeting.start_date)
  const meetingEndDate = new Date(meeting.end_date)
  const meetingProgress = Math.round(
    ((Date.now() - meetingStartDate.getTime()) /
      (meetingEndDate.getTime() - meetingStartDate.getTime())) *
      100,
  )

  // meetingStartDate as dd.MM.yyyy HH:mm
  const meetingDateStartFormat =
    meetingStartDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }) +
    " " +
    meetingStartDate.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })

  const tense = getMeetingTenseByMeeting(meeting)

  const endIsOnSameDayAsStart =
    meetingStartDate.toDateString() === meetingEndDate.toDateString()
  const meetingStartTime = meetingStartDate.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
  const meetingEndTime =
    (!endIsOnSameDayAsStart
      ? meetingEndDate.toLocaleDateString(undefined, {
          month: "numeric",
          day: "numeric",
        }) + " "
      : "") +
    meetingEndDate.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  return (
    <GlowingModalCard
      classNames={{
        container: "w-full",
        content: clsx(
          "flex flex-col justify-between space-y-2 rounded-lg",
          "px-5 py-4 transition-colors bg-neutral-950",
          {
            "border-red-600 hover:border-red-500": !meeting.is_ready,
          },
        ),
      }}
    >
      <div>
        {/* Project Header */}
        <Link
          className="flex items-center gap-2 text-xs text-default-400"
          href={`/project/${meeting.project_id}`}
        >
          <ResolveProjectName projectID={meeting.project_id} />
        </Link>

        {/* Meeting Name */}
        <Link
          href={`/project/${meeting.project_id}/meeting/${meeting.ID}`}
          className="flex flex-row items-center space-x-2"
        >
          <span className="inline-flex items-baseline">
            <MeetingChip hideIcon meeting={meeting} />
          </span>
          <span className="truncate text-start text-lg font-semibold">
            {meeting.name}
          </span>
          {!meeting.is_ready && (
            <Tooltip
              content="This meeting has not been marked as ready"
              color="danger"
            >
              <span className="text-red-500">
                <BsTriangleFill />
              </span>
            </Tooltip>
          )}
        </Link>
      </div>

      <div>
        <p className="flex items-center gap-2 text-neutral-400">
          {meetingDateStartFormat}
          <DurationTag date={meetingStartDate} textOnly />
        </p>

        {/* Meeting Date */}
        {tense === "ongoing" ? (
          <Flex justify="between" className="w-full gap-2">
            <span className="whitespace-nowrap">{meetingStartTime}</span>
            <Progress
              minValue={0}
              maxValue={100}
              value={meetingProgress}
              color="success"
            />
            <span className="whitespace-nowrap">{meetingEndTime}</span>
          </Flex>
        ) : (
          <></>
        )}
      </div>

      <Hr />

      {/* Meeting Actions */}
      <Flex justify="between" gap={2} className="mt-4">
        <ScrollShadow orientation="horizontal" hideScrollBar>
          <Flex gap={1}>
            {meeting.tags?.length > 0 ? (
              meeting.tags.map((tag) => (
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
              <span className="text-sm italic text-default-400">No Tags</span>
            )}
          </Flex>
        </ScrollShadow>
        <AvatarGroup max={3} size="sm">
          {meeting.assigned_users?.map((user) => (
            <Avatar key={user.id} src={getUserAvatarURL(user.id)} />
          ))}
        </AvatarGroup>
      </Flex>
    </GlowingModalCard>
  )
}
