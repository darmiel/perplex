import { Divider, Input, useInput } from "@geist-ui/core"
import Link from "next/link"
import { Fragment } from "react"
import { BsGear, BsPersonAdd, BsX } from "react-icons/bs"
import { ClipLoader } from "react-spinners"
import { Tooltip } from "react-tooltip"

import { User } from "@/api/types"
import { extractErrorMessage, includesFold } from "@/api/util"
import Flex from "@/components/ui/layout/Flex"
import UserAvatar from "@/components/user/UserAvatar"
import { useAuth } from "@/contexts/AuthContext"

export default function SectionAssignUsers({
  projectID,
  users,
  onAssign,
  onUnassign,
  loadingUser,
}: {
  projectID: number
  users: User[]
  onAssign: (user: User) => void
  onUnassign: (user: User) => void
  loadingUser?: string // the User ID which is loading
}) {
  const { projects } = useAuth()
  const { state: filterText, bindings } = useInput("")

  // get users for the project
  const projectUsersQuery = projects!.useUserList(projectID)

  const displayUsersToAdd =
    projectUsersQuery.data?.data.filter((user) => {
      if (filterText && !includesFold(user.name, filterText)) return false
      return !users.map((u) => u.id).includes(user.id)
    }) ?? []

  const isLoading = !!loadingUser

  return (
    <div className="flex flex-col space-y-2">
      {/* Display a List of Users which can be removed */}
      {users.map((user) => (
        <div key={user.id} className="flex justify-between items-center">
          <Flex x={2}>
            <UserAvatar className="rounded-full h-6 w-6" userID={user.id} />
            <span>{user.name}</span>
          </Flex>
          <button
            className="cursor-pointer"
            onClick={() => !isLoading && onUnassign(user)}
          >
            {isLoading && loadingUser === user.id ? (
              <ClipLoader color="orange" size="1em" />
            ) : (
              <BsX />
            )}
          </button>
        </div>
      ))}

      {/* Display a modal which can assign Users */}
      <Tooltip
        id="assign-users"
        place="left"
        clickable
        openOnClick
        style={{
          backgroundColor: "black",
          borderColor: "#3f3f3f",
          borderWidth: "1px",
          borderRadius: "0.5rem",
        }}
      >
        <div className="w-72 py-2 space-y-2">
          <Flex span justify="between">
            <h3 className="font-semibold text-neutral-300">Assign Users</h3>
            <Link href={`/project/${projectID}`}>
              <Flex
                span
                x={1}
                className="px-2 py-1 rounded-md border border-transparent bg-neutral-800 transition duration-300 ease-in-out group hover:bg-transparent hover:border-neutral-800"
              >
                <span className="group-hover:animate-spin">
                  <BsGear />
                </span>
                <span>Manage Users</span>
              </Flex>
            </Link>
          </Flex>
          <Input placeholder="Filter Users" width="100%" {...bindings} />
          <Divider />

          {/* Display Users */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {projectUsersQuery.isLoading ? (
              <>Loading Users...</>
            ) : projectUsersQuery.isError ? (
              <>
                Error: <pre>{extractErrorMessage(projectUsersQuery.error)}</pre>
              </>
            ) : displayUsersToAdd.length > 0 ? (
              displayUsersToAdd.map((user, index) => (
                <Fragment key={user.id}>
                  {index !== 0 && <Divider />}
                  <button
                    className="w-full flex space-x-2 px-2 py-2 rounded-md items-center transition duration-300 ease-in-out bg-transparent hover:bg-neutral-800 group"
                    onClick={() => loadingUser !== user.id && onAssign(user)}
                    disabled={isLoading}
                  >
                    {/* User Avatar */}
                    <UserAvatar
                      className="rounded-full h-6 w-6"
                      userID={user.id}
                    />

                    {/* User Title */}
                    <span>{user.name}</span>

                    {/* Loading Spinner */}
                    {loadingUser === user.id && (
                      <ClipLoader color="orange" size="1em" />
                    )}
                  </button>
                </Fragment>
              ))
            ) : (
              <>No Users</>
            )}
          </div>
        </div>
      </Tooltip>

      <button
        data-tooltip-id="assign-users"
        className="border border-neutral-500 text-neutral-500 rounded-full text-sm px-3 py-1 flex flex-row items-center"
      >
        <div className="flex flex-row items-center justify-center space-x-2">
          <BsPersonAdd />
          <div>Assign</div>
        </div>
      </button>
    </div>
  )
}
