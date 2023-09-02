import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/router"
import { Fragment, ReactNode } from "react"
import { BsGithub, BsHouse, BsPersonCheck } from "react-icons/bs"
import { Tooltip } from "react-tooltip"

import PerplexLogo from "@/../public/perplex.svg"
import { navigationBorderRight } from "@/api/classes"
import ResolveUserName from "@/components/user/ResolveUserName"
import UserAvatar from "@/components/user/UserAvatar"
import { useAuth } from "@/contexts/AuthContext"

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
        className={`flex flex-col justify-center items-center space-y-2 w-full px-3 py-2 ${
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

export default function Navbar() {
  const { projects } = useAuth()

  const router = useRouter()
  const { project_id: projectID } = router.query
  const projectListQuery = projects!.useList()

  const p = projectListQuery.data?.data ?? []

  return (
    <nav
      className={`${navigationBorderRight} w-16 bg-section-darkest flex flex-col justify-between`}
    >
      <div>
        <div className="p-4 w-full">
          <Image src={PerplexLogo} alt="Logo" />
        </div>

        <ul className="mt-6 flex flex-col space-y-4">
          {/* Dashboard Link */}
          <NavbarItem href="/">
            <BsHouse />
            <span className="text-xs text-neutral-400">Home</span>
          </NavbarItem>

          {/* Project List */}
          {p.map((project, index) => (
            <Fragment key={index}>
              <NavbarItem
                key={index}
                href={`/project/${project.ID}`}
                tooltip_id={`tooltip-project-${project.ID}`}
              >
                <UserAvatar
                  userID={String(project.ID)}
                  className={`${
                    String(project.ID) === projectID ? "" : "grayscale"
                  } rounded-[50%] hover:rounded-md hover:grayscale-0 transition duration-150 ease-in-out hover:scale-110 w-full`}
                />
              </NavbarItem>
              <Tooltip
                id={`tooltip-project-${project.ID}`}
                place="right"
                offset={10}
                variant="dark"
                opacity={1.0}
                style={{
                  backgroundColor: "black",
                }}
              >
                <span className="flex space-x-1 items-center">
                  <span className="font-semibold">{project.name}</span>
                  <span className="text-neutral-400">#{project.ID}</span>
                </span>
                <span className="flex space-x-1 items-center">
                  <span className="text-neutral-400">Created by</span>
                  <span>
                    <ResolveUserName userID={project.owner_id} />
                  </span>
                </span>
              </Tooltip>
            </Fragment>
          ))}
        </ul>
      </div>
      <div>
        <ul className="mt-6 flex flex-col space-y-2">
          {/* User Settings */}
          <NavbarItem href="/user">
            <BsPersonCheck />
            <span className="text-xs text-neutral-400">User</span>
          </NavbarItem>

          {/* GitHub Link to Repository */}
          <li className="w-full p-4">
            <a href="https://github.com/darmiel/perplex">
              <BsGithub size="100%" />
            </a>
          </li>
        </ul>
      </div>
      <Tooltip
        id="project-name"
        place="right"
        variant="dark"
        opacity={1.0}
        style={{
          backgroundColor: "black",
        }}
      />
    </nav>
  )
}
