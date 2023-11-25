import { Chip } from "@nextui-org/react"

import { Tag } from "@/api/types"

export default function TopicTagChip({ tag }: { tag: Tag }) {
  return (
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
  )
}
