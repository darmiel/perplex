import Image from "next/image"
import Link from "next/link"
import UserAvatar from "../user/UserAvatar"

export default function NavbarItem({
  alt,
  href,
}: {
  alt: string
  href: string
}) {
  return (
    <li>
      <Link href={href}>
        <UserAvatar userID={alt} />
      </Link>
    </li>
  )
}
