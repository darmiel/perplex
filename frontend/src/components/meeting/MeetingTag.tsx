import { BsForward, BsPlay, BsRewind } from "react-icons/bs"

import { Meeting } from "@/api/types"
import Tag from "@/components/ui/tag/Tag"

export const tagStyles = {
  past: {
    color: "text-neutral-500",
    icon: <BsRewind />,
    text: "Past",
    className: "bg-neutral-700 text-white",
  },
  future: {
    color: "text-blue-600",
    icon: <BsForward />,
    text: "Future",
    className: "bg-blue-500 text-white",
  },
  ongoing: {
    color: "text-green-600",
    icon: <BsPlay />,
    text: "Ongoing",
    className: "bg-green-600 text-white",
  },
}

export type MeetingTense = "past" | "future" | "ongoing"

export function getMeetingTense(start: Date, end: Date): MeetingTense {
  const now = new Date()
  if (start.getTime() < now.getTime() && now.getTime() < end.getTime()) {
    return "ongoing"
  }
  if (start.getTime() < now.getTime()) {
    return "past"
  }
  return "future"
}

export function getMeetingTenseByMeeting(meeting: Meeting): MeetingTense {
  const start = new Date(meeting.start_date)
  const end = new Date(meeting.end_date)

  return getMeetingTense(start, end)
}

export default function MeetingTag({
  start,
  end,
  icon = false,
}: {
  start: Date
  end: Date
  icon?: boolean
}) {
  let tag = tagStyles[getMeetingTense(start, end)]
  if (icon) {
    return <div className={tag.color}>{tag.icon}</div>
  }
  return (
    <Tag className={tag.className}>
      <div>{tag.icon}</div>
      <div>{tag.text}</div>
    </Tag>
  )
}
