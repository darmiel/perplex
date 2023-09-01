import { BsBookmarkStar, BsBookmarkStarFill } from "react-icons/bs"

import { Action } from "@/api/types"
import Tag from "@/components/ui/tag/Tag"

// TODO: remove duplicate
const tags = {
  open: {
    icon: <BsBookmarkStar />,
    text: "Open",
    className: "bg-red-600 text-white",
  },
  close: {
    icon: <BsBookmarkStarFill />,
    text: "Closed",
    className: "bg-green-600 text-white",
  },
}

export default function ActionTag({
  action,
  className = "",
}: {
  action: Action
  className?: string
}) {
  const tag = tags[action.closed_at.Valid ? "close" : "open"]
  return (
    <Tag className={`${tag.className} ${className}`}>
      <span>{tag.icon}</span>
      <span>{tag.text}</span>
    </Tag>
  )
}
