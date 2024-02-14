import { Avatar } from "@nextui-org/react"
import Image from "next/image"

import { User } from "@/api/types"
import { getUserAvatarURL } from "@/util/avatar"

export type UserAvatarImage = {
  // the user ID
  userID: string
  // the alt text
  alt?: string
  // the class name
  className?: string
  // the height of the image
  height?: number
  // the width of the image
  width?: number
}

export function UserAvatarImage({
  userID,
  alt,
  className,
  height = 256,
  width = 256,
}: UserAvatarImage) {
  return (
    <Image
      src={getUserAvatarURL(userID)}
      alt={alt ?? userID}
      className={`${className ?? "w-10 rounded-full"} `}
      height={height}
      width={width}
      onDragStart={() => false}
    />
  )
}

/**
 * UserAvatarProps is the props for the UserAvatar component
 * Provide either a user ID or a user object
 */
export type UserAvatarProps = {
  // the user ID
  userID?: string
  // the user object
  user?: User
}

export function UserAvatar({ userID, user }: UserAvatarProps) {
  if (!userID && !user) throw new Error("No user ID or user provided")
  const extractedUserID = user ? user.id : userID!
  return (
    <Avatar alt={userID} size="sm" src={getUserAvatarURL(extractedUserID)} />
  )
}
