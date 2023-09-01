import { Action } from "@/api/types"
import ActionTag from "@/components/action/ActionTag"
import Hr from "@/components/ui/Hr"
import { PriorityTag, TagContainer } from "@/components/ui/tag/Tag"
import TagList from "@/components/ui/tag/TagList"
import { TruncateTitle } from "@/components/ui/text/TruncateText"

export default function ActionListItemSmall({ action }: { action: Action }) {
  return (
    <div className="flex flex-col space-y-1">
      <div className="flex items-center text-neutral-400 space-x-2">
        <div>
          <ActionTag action={action} />
        </div>
        <div className="flex flex-col">
          <TruncateTitle truncate={30} className="text-sm">
            {action.title}
          </TruncateTitle>
        </div>
      </div>

      {(!!action.priority_id || action.tags?.length > 0) && (
        <div>
          <Hr className="py-1" />
          <TagList>
            {!!action.priority_id && action.priority && (
              <PriorityTag priority={action.priority} />
            )}
            {action.tags?.map((tag) => (
              <TagContainer
                key={tag.ID}
                style="color-border"
                color={tag.color}
                className="text-xs"
              >
                {tag.title}
              </TagContainer>
            ))}
          </TagList>
        </div>
      )}
    </div>
  )
}
