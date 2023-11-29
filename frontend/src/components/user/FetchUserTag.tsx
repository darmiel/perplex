import ResolveUserName from "@/components/resolve/ResolveUserName"
import UserTag from "@/components/user/UserTag"

export default function FetchUserTag({
  userID,
  onRemove,
  onRemoveLoading,
  size = "md",
}: {
  userID: string
  onRemove?: () => void
  onRemoveLoading?: boolean
  size?: "sm" | "md" | "lg"
}) {
  return (
    <UserTag
      userID={userID}
      displayName={<ResolveUserName userID={userID} />}
      onRemove={onRemove}
      onRemoveLoading={onRemoveLoading}
      size={size}
    />
  )
}
