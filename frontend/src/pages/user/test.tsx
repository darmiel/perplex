import { ScrollShadow } from "@nextui-org/react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/router"
import { ReactNode } from "react"
import { BsGithub, BsHouse, BsPersonCheck } from "react-icons/bs"

import PerplexLogo from "@/../public/perplex.svg"

function NavbarItem({
  selected = false,
  href,
  tooltip_id,
  children,
}: {
  selected?: boolean
  href: string
  tooltip_id?: string
  children: ReactNode
}) {
  const router = useRouter()
  return (
    <Link href={href} className="w-full" data-tooltip-id={tooltip_id}>
      <li
        className={`flex w-full flex-col items-center justify-center space-y-2 px-3 py-2 ${
          selected || router.asPath === href
            ? "border-l-2 border-l-primary-600 text-primary-600"
            : ""
        }`}
      >
        {children}
      </li>
    </Link>
  )
}

export default function TestPage() {
  return (
    <nav
      className={`flex h-full max-h-screen w-16 flex-col justify-between bg-section-darker`}
    >
      <div className="flex flex-grow flex-col overflow-y-auto">
        <div className="w-full p-4">
          <Image src={PerplexLogo} alt="Logo" />
        </div>

        <ul className="mt-6 flex flex-grow flex-col space-y-4">
          {/* Dashboard Link */}
          <NavbarItem href="/">
            <BsHouse />
            <span className="text-xs text-neutral-400">Home</span>
          </NavbarItem>

          {/* Project List */}
          <ScrollShadow className="no-scrollbar flex-grow">
            <NavbarItem href="#">A</NavbarItem>
            <NavbarItem href="#">A</NavbarItem>
            <NavbarItem href="#">A</NavbarItem>
            <NavbarItem href="#">A</NavbarItem>
            <NavbarItem href="#">A</NavbarItem>
            <NavbarItem href="#">A</NavbarItem>
            <NavbarItem href="#">A</NavbarItem>
            <NavbarItem href="#">A</NavbarItem>
            <NavbarItem href="#">A</NavbarItem>
            <NavbarItem href="#">A</NavbarItem>
            <NavbarItem href="#">A</NavbarItem>
            <NavbarItem href="#">A</NavbarItem>
            <NavbarItem href="#">A</NavbarItem>
            <NavbarItem href="#">A</NavbarItem>
            <NavbarItem href="#">A</NavbarItem>
            <NavbarItem href="#">A</NavbarItem>
            <NavbarItem href="#">A</NavbarItem>
            <NavbarItem href="#">A</NavbarItem>
            <NavbarItem href="#">A</NavbarItem>
            <NavbarItem href="#">A</NavbarItem>
            <NavbarItem href="#">A</NavbarItem>
            <NavbarItem href="#">A</NavbarItem>
            <NavbarItem href="#">A</NavbarItem>
            <NavbarItem href="#">A</NavbarItem>
          </ScrollShadow>
        </ul>
      </div>
      <div>
        <ul className="mt-6 flex flex-col space-y-2">
          {/* User Settings */}
          <NavbarItem href="/user">
            <BsPersonCheck />
            <span className="text-xs text-neutral-400">User</span>
          </NavbarItem>

          {/* Notifications */}
          <li className="w-full p-5">not</li>

          {/* GitHub Link to Repository */}
          <li className="w-full p-4">
            <a href="https://github.com/darmiel/perplex">
              <BsGithub size="100%" />
            </a>
          </li>
        </ul>
      </div>
    </nav>
  )
}
