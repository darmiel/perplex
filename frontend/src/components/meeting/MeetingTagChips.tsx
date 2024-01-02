import { Chip } from "@nextui-org/react"

import { Tag } from "@/api/types"
import Flex from "@/components/ui/layout/Flex"

export function MeetingTagChips({
  tags,
  displayNoTagsLabel = false,
}: {
  tags: Tag[]
  displayNoTagsLabel?: boolean
}) {
  return tags.length > 0 ? (
    <Flex gap={1}>
      {tags.map((tag) => (
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
      ))}
    </Flex>
  ) : displayNoTagsLabel ? (
    <Flex gap={1}>
      <span className="text-sm italic text-default-400">No Tags</span>
    </Flex>
  ) : undefined
}
