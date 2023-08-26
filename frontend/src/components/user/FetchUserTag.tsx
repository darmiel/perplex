import ResolveUserName from "@/components/user/ResolveUserName"
import UserTag from "@/components/user/UserTag"

export default function FetchUserTag({ userID }: { userID: string }) {
  return (
    <UserTag
      userID={userID}
      displayName={<ResolveUserName userID={userID} />}
    />
  )
}
