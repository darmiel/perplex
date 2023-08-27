import ResolveUserName from "@/components/user/ResolveUserName"
import UserTag from "@/components/user/UserTag"

export default function FetchUserTag({
  userID,
  onRemove,
  onRemoveLoading,
}: {
  userID: string
  onRemove?: () => void
  onRemoveLoading?: boolean
}) {
  return (
    <UserTag
      userID={userID}
      displayName={<ResolveUserName userID={userID} />}
      onRemove={onRemove}
      onRemoveLoading={onRemoveLoading}
    />
  )
}
