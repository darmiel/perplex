import { User } from "@/api/types"
import TagList from "@/components/ui/tag/TagList"
import FetchUserTag from "@/components/user/FetchUserTag"

export default function UserTagList({
  users,
  onRemove,
  onRemoveLoading,
  children,
}: {
  users?: User[] | string[]
  onRemove?: (userID: string) => void
  onRemoveLoading?: boolean
  children?: React.ReactNode
}) {
  return (
    <TagList>
      {users?.map((user) => {
        const id = typeof user === "string" ? user : user.id
        return (
          <FetchUserTag
            key={id}
            userID={id}
            onRemove={onRemove ? () => onRemove?.(id) : undefined}
            onRemoveLoading={onRemoveLoading}
          />
        )
      })}
      {children}
    </TagList>
  )
}
