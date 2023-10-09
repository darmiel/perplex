import { Button } from "@nextui-org/react"
import clsx from "clsx"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/router"
import { Fragment, ReactNode, Ref, useRef, useState } from "react"
import {
  BsArrowLeft,
  BsArrowRight,
  BsBell,
  BsBellFill,
  BsGear,
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
import ProjectModalManageProjects from "@/components/project/modals/ProjectModalManageProjects"
import ResolveUserName from "@/components/resolve/ResolveUserName"
import ModalPopup from "@/components/ui/modal/ModalPopup"
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

export default function Navbar() {
  const [showManageProjects, setShowManageProjects] = useState(false)

  const [doNotHide, setDoNotHide] = useState(false)

  const { projects, users } = useAuth()

  const router = useRouter()
  const { project_id: projectID } = router.query

  const projectListQuery = projects!.useList()
  const notificationListQuery = users!.useNotificationUnread()

  const p = projectListQuery.data?.data ?? []

  const unreadNotifications = notificationListQuery.data?.data ?? []
  const notificationRef = useRef<PopupActions>()

  return (
    <>
      {!doNotHide && (
        <motion.div animate={{ x: 25 }}>
          <Button
            isIconOnly
            startContent={<BsArrowRight />}
            className="absolute bottom-4 left-4 z-50 -translate-x-[25px] md:hidden"
            onClick={() => setDoNotHide((prev) => !prev)}
          />
        </motion.div>
      )}
      <div className={clsx({ "hidden md:block": !doNotHide })}>
        <nav
          className={`${navigationBorderRight} sticky top-0 z-40 flex h-full max-h-screen w-16 flex-col justify-between bg-section-darkest`}
        >
          <div className="flex flex-grow flex-col overflow-y-auto">
            <div className="w-full p-4">
              <Image src={PerplexLogo} alt="Logo" />
            </div>

            <ul className="mt-6 flex flex-grow flex-col space-y-4 overflow-y-auto">
              {/* Dashboard Link */}
              <NavbarItem href="/">
                <BsHouse />
                <span className="text-xs text-neutral-400">Home</span>
              </NavbarItem>

              {/* Project List */}
              <div className="no-scrollbar z-50 flex-grow">
                {p.map((project, index) => (
                  <Fragment key={index}>
                    <NavbarItem
                      key={index}
                      href={`/project/${project.ID}`}
                      tooltip_id={`tooltip-project-${project.ID}`}
                      selected={String(project.ID) === projectID}
                    >
                      <UserAvatar
                        userID={String(project.ID)}
                        className={`${
                          String(project.ID) === projectID ? "" : "grayscale"
                        } w-full rounded-[50%] transition duration-150 ease-in-out hover:scale-110 hover:rounded-md hover:grayscale-0`}
                      />
                    </NavbarItem>
                    <Tooltip
                      id={`tooltip-project-${project.ID}`}
                      place="right"
                      offset={10}
                      variant="dark"
                      opacity={1.0}
                      style={{
                        zIndex: 999999,
                      }}
                      className="bg-section-darker"
                      closeOnScroll={false}
                      clickable
                    >
                      <span className="flex items-center space-x-1">
                        <span className="font-semibold">{project.name}</span>
                        <span className="text-neutral-400">#{project.ID}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span className="text-neutral-400">Created by</span>
                        <span>
                          <ResolveUserName userID={project.owner_id} />
                        </span>
                      </span>
                    </Tooltip>
                  </Fragment>
                ))}

                <li className="flex w-full items-center justify-center px-3 py-2">
                  <button
                    onClick={() => setShowManageProjects(true)}
                    className="group flex h-10 w-10 animate-pulse items-center justify-center rounded-md bg-neutral-700 bg-opacity-0 p-2 text-lg text-neutral-400 transition duration-300 hover:scale-105 hover:bg-opacity-100 hover:text-white"
                  >
                    <span className="group-hover:animate-spin">
                      <BsGear />
                    </span>
                  </button>
                </li>

                {/* Manage Projects */}
                <ModalPopup
                  open={showManageProjects}
                  setOpen={setShowManageProjects}
                >
                  <ProjectModalManageProjects
                    onClose={() => setShowManageProjects(false)}
                  />
                </ModalPopup>
              </div>
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
                    <button className="relative inline-flex items-center text-center text-sm font-medium">
                      {unreadNotifications.length > 0 ? (
                        <>
                          <BsBellFill size="100%" />

                          {/* Show annoying red dot with bounce animation */}
                          <div className="absolute -right-3 -top-3 inline-flex h-6 w-6 animate-ping items-center justify-center rounded-full border-2 border-section-darkest bg-red-500 text-xs font-bold text-white"></div>
                          <div className="absolute -right-3 -top-3 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-section-darkest bg-red-500 text-xs font-bold text-white">
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

              {doNotHide && (
                <li className="block w-full items-center p-4 text-center md:hidden">
                  <Button
                    isIconOnly
                    size="sm"
                    startContent={<BsArrowLeft />}
                    onClick={() => setDoNotHide((prev) => !prev)}
                    variant="light"
                  />
                </li>
              )}
            </ul>
          </div>
        </nav>
      </div>
    </>
  )
}
