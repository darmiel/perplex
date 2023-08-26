import { User } from "@/api/types"
import TagList from "@/components/ui/tag/TagList"
import FetchUserTag from "@/components/user/FetchUserTag"

export default function UserTagList({ users }: { users?: User[] | string[] }) {
  return (
    <TagList>
      {users?.map((user) => {
        const id = typeof user === "string" ? user : user.id
        return <FetchUserTag key={id} userID={id} />
      })}
    </TagList>
  )
}
