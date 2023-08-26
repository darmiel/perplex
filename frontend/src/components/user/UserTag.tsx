import { ReactNode } from "react"

import UserAvatar from "@/components/user/UserAvatar"
import { useAuth } from "@/contexts/AuthContext"

export default function UserTag({
  userID,
  displayName,
}: {
  userID: string
  displayName: string | ReactNode
}) {
  const { user } = useAuth()
  return (
    <div
      className={`${
        userID === user?.uid
          ? "bg-primary-400 bg-opacity-20 border-primary-500 text-primary-500"
          : "border-neutral-500 text-neutral-500"
      } border rounded-full px-3 py-1 flex flex-row items-center space-x-2`}
    >
      <div>
        <UserAvatar userID={userID} className="h-4 w-4" />
      </div>
      <div>
        <span>{displayName}</span>
      </div>
    </div>
  )
}
