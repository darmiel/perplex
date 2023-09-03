import { ReactNode } from "react"
import { BsX } from "react-icons/bs"
import { ClipLoader } from "react-spinners"

import UserAvatar from "@/components/user/UserAvatar"
import { useAuth } from "@/contexts/AuthContext"

export default function UserTag({
  userID,
  displayName,
  onRemove,
  onRemoveLoading,
}: {
  userID: string
  displayName: string | ReactNode
  onRemove?: () => void
  onRemoveLoading?: boolean
}) {
  const { user } = useAuth()
  return (
    <div
      className={`${
        userID === user?.uid
          ? "border-primary-500 bg-primary-400 bg-opacity-20 text-primary-500"
          : "border-neutral-500 text-neutral-500"
      } flex flex-row items-center space-x-2 rounded-full border px-3 py-1`}
    >
      <div>
        <UserAvatar userID={userID} className="h-4 w-4 rounded-full" />
      </div>
      <div>
        <span>{displayName}</span>
      </div>
      {onRemove &&
        (onRemoveLoading ? (
          <div className="cursor-pointer" onClick={() => onRemove()}>
            <ClipLoader size={10} color="orange" />
          </div>
        ) : (
          <div className="cursor-pointer" onClick={() => onRemove()}>
            <BsX />
          </div>
        ))}
    </div>
  )
}
