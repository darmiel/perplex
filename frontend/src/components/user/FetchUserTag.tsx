import ResolveUserName from "./ResolveUserName"
import UserTag from "./UserTag"

export default function FetchUserTag({ userID }: { userID: string }) {
  return (
    <UserTag
      userID={userID}
      displayName={<ResolveUserName userID={userID} />}
    />
  )
}
