import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/router"
import { Fragment, ReactNode, Ref, useRef } from "react"
import {
  BsBell,
  BsBellFill,
  BsGithub,
  BsHouse,
  BsPersonCheck,
} from "react-icons/bs"
import { Tooltip } from "react-tooltip"
import Popup from "reactjs-popup"
import { PopupActions } from "reactjs-popup/dist/types"

import PerplexLogo from "@/../public/perplex.svg"
import { navigationBorderRight } from "@/api/classes"
import NotificationModal from "@/components/notification/NotificationModal"
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
  const { projects, users } = useAuth()

  const router = useRouter()
  const { project_id: projectID } = router.query

  const projectListQuery = projects!.useList()
  const notificationListQuery = users!.useNotificationUnread()

  const p = projectListQuery.data?.data ?? []

  const unreadNotifications = notificationListQuery.data?.data ?? []
  const notificationRef = useRef<PopupActions>()

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
                  zIndex: 999999999,
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

          {/* Notifications */}
          <li className="w-full p-5">
            <Popup
              contentStyle={{
                background: "none",
                border: "none",
                width: "auto",
              }}
              trigger={
                <button className="relative inline-flex items-center text-sm font-medium text-center">
                  {unreadNotifications.length > 0 ? (
                    <>
                      <BsBellFill size="100%" />

                      {/* Show annoying red dot with bounce animation */}
                      <div className="animate-ping absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 border-2 border-section-darkest rounded-full -top-3 -right-3"></div>
                      <div className="absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 border-2 border-section-darkest rounded-full -top-3 -right-3">
                        {unreadNotifications.length}
                      </div>
                    </>
                  ) : (
                    <BsBell size="100%" />
                  )}
                </button>
              }
              ref={notificationRef as Ref<PopupActions>}
              closeOnDocumentClick={false}
              closeOnEscape={true}
              position="right center"
              offsetX={30}
              offsetY={-60}
              arrow={false}
            >
              <NotificationModal
                onClose={() => notificationRef?.current?.close()}
              />
            </Popup>
          </li>

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
