import { BsForward, BsPlay, BsRewind } from "react-icons/bs"

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

export function getMeetingTense(date: Date): MeetingTense {
  const now = new Date()
  if (date.getTime() < now.getTime() - 2 * 3600 * 1000) {
    return "past"
  }
  if (date.getTime() > now.getTime() + 2 * 3600 * 1000) {
    return "future"
  }
  return "ongoing"
}

export default function MeetingTag({
  date,
  icon = false,
}: {
  date: Date
  icon?: boolean
}) {
  let tag = tagStyles[getMeetingTense(date)]
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
