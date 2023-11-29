import { Chip } from "@nextui-org/react"
import { BsCheckCircle, BsCircle } from "react-icons/bs"

import { Topic } from "@/api/types"

const tags = {
  open: {
    icon: <BsCircle />,
    text: "Open",
    color: "danger",
  },
  close: {
    icon: <BsCheckCircle />,
    text: "Closed",
    color: "success",
  },
} as const

export default function TopicTag({
  topic,
  className = "",
}: {
  topic: Topic
  className?: string
}) {
  const tag = tags[topic.closed_at.Valid ? "close" : "open"]
  return (
    <Chip color={tag.color} variant="shadow">
      {tag.text}
    </Chip>
  )
}
