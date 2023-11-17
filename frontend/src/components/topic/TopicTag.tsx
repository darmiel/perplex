import { BsCheckSquareFill, BsCircle } from "react-icons/bs"

import { Topic } from "@/api/types"
import Tag from "@/components/ui/tag/Tag"

const tags = {
  open: {
    icon: <BsCircle />,
    text: "Open",
    className: "bg-red-600 text-white",
  },
  close: {
    icon: <BsCheckSquareFill />,
    text: "Closed",
    className: "bg-green-600 text-white",
  },
}

export default function TopicTag({
  topic,
  className = "",
}: {
  topic: Topic
  className?: string
}) {
  const tag = tags[topic.closed_at.Valid ? "close" : "open"]
  return (
    <Tag className={`${tag.className} ${className}`}>
      <span>{tag.icon}</span>
      <span>{tag.text}</span>
    </Tag>
  )
}
