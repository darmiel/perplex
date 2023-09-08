import { Divider, Input } from "@nextui-org/react"
import { Fragment, useState } from "react"
import { BsPersonAdd, BsSearch, BsX } from "react-icons/bs"
import { ClipLoader } from "react-spinners"
import { Tooltip } from "react-tooltip"

import { User } from "@/api/types"
import { extractErrorMessage, includesFold } from "@/api/util"
import Flex from "@/components/ui/layout/Flex"
import ManageUsersButton from "@/components/ui/overview/common/ManageUsersButton"
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
  const [filter, setFilter] = useState("")

  // get users for the project
  const projectUsersQuery = projects!.useUserList(projectID)

  const displayUsersToAdd =
    projectUsersQuery.data?.data.filter((user) => {
      if (filter && !includesFold(user.name, filter)) {
        return false
      }
      return !users.map((u) => u.id).includes(user.id)
    }) ?? []

  const isLoading = !!loadingUser

  return (
    <div className="flex flex-col space-y-2">
      {/* Display a List of Users which can be removed */}
      {users.map((user) => (
        <div key={user.id} className="flex items-center justify-between">
          <Flex x={2}>
            <UserAvatar className="h-6 w-6 rounded-full" userID={user.id} />
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
        <div className="w-72 space-y-2 py-2">
          <Flex span justify="between">
            <h3 className="font-semibold text-neutral-300">Assign Users</h3>
            <ManageUsersButton projectID={projectID} />
          </Flex>
          <Input
            variant="bordered"
            value={filter}
            onValueChange={setFilter}
            startContent={<BsSearch />}
            placeholder={`Search in Topics...`}
            width="100%"
          />
          <Divider />

          {/* Display Users */}
          <div className="max-h-60 space-y-2 overflow-y-auto">
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
                    className="group flex w-full items-center space-x-2 rounded-md bg-transparent px-2 py-2 transition duration-300 ease-in-out hover:bg-neutral-800"
                    onClick={() => loadingUser !== user.id && onAssign(user)}
                    disabled={isLoading}
                  >
                    {/* User Avatar */}
                    <UserAvatar
                      className="h-6 w-6 rounded-full"
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
        className="flex flex-row items-center rounded-full border border-neutral-500 px-3 py-1 text-sm text-neutral-500"
      >
        <div className="flex flex-row items-center justify-center space-x-2">
          <BsPersonAdd />
          <div>Assign</div>
        </div>
      </button>
    </div>
  )
}
