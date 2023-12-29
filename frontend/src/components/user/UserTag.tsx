import clsx from "clsx"
import { ReactNode } from "react"
import { BsX } from "react-icons/bs"
import { ClipLoader } from "react-spinners"

import { UserAvatarImage } from "@/components/user/UserAvatar"
import { useAuth } from "@/contexts/AuthContext"

export default function UserTag({
  userID,
  displayName,
  onRemove,
  onRemoveLoading,
  size,
}: {
  userID: string
  displayName: string | ReactNode
  onRemove?: () => void
  onRemoveLoading?: boolean
  size?: "sm" | "md" | "lg"
}) {
  const { user } = useAuth()
  return (
    <div
      className={clsx("flex w-fit flex-row items-center rounded-full border", {
        // size md:
        "space-x-2 px-3 py-1": size === "md",
        // size sm:
        "space-x-1 px-1.5 py-1 text-xs": size === "sm",

        "border-primary-500 bg-primary-400 bg-opacity-20 text-primary-500":
          userID === user?.uid,
        "border-neutral-500 text-neutral-500": userID !== user?.uid,
      })}
    >
      <div>
        <UserAvatarImage userID={userID} className="h-4 w-4 rounded-full" />
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
