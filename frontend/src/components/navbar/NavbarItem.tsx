import { usePathname } from "next/navigation"

interface Props {
  title: string
  href: string
  badge?: string
  // active?: boolean
}

export default function NavbarItem({ title, href, badge }: Props) {
  const pathname = usePathname()
  const active = pathname === href

  return (
    <li>
      <a
        href={href}
        className={`flex items-center p-2 rounded-lg text-white hover:bg-gray-700 group ${
          active && "bg-blue-700"
        }`}
      >
        <span className="flex-1 ml-3 whitespace-nowrap">{title}</span>
        {badge && (
          <span className="inline-flex items-center justify-center px-2 ml-3 text-sm font-medium text-gray-800 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-300">
            {badge}
          </span>
        )}
      </a>
    </li>
  )
}
