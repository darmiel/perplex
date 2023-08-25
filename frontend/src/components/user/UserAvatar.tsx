import Image from "next/image"

export default function UserAvatar({
  userID,
  alt,
  className,
  height = 256,
  width = 256,
}: {
  userID: string
  className?: string
  alt?: string
  height?: number
  width?: number
}) {
  return (
    <Image
      src={`https://api.dicebear.com/6.x/shapes/svg?seed=${userID}`}
      alt={alt ?? userID}
      className={`${className ?? "w-10"} rounded-full`}
      height={height}
      width={width}
    />
  )
}
