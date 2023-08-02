import Link from "next/link"

export default function NavbarItem({
  alt,
  href,
}: {
  alt: string
  href: string
}) {
  // const pathname = usePathname()
  // TODO: maybe do something?
  // const active = pathname === href
  return (
    <li>
      <Link href={href}>
        <img
          src={`https://api.dicebear.com/6.x/shapes/svg?seed=${alt}`}
          alt={alt}
          className="w-10 h-10 mt-1 rounded-full inline-block"
        />
      </Link>
    </li>
  )
}
