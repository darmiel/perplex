import { Divider, Input } from "@nextui-org/react"
import { Fragment, useState } from "react"
import { BsPersonAdd } from "react-icons/bs"
import { ClipLoader } from "react-spinners"
import { Tooltip } from "react-tooltip"

import { User } from "@/api/types"
import { extractErrorMessage, includesFold } from "@/api/util"
import Flex from "@/components/ui/layout/Flex"
import ManageUsersButton from "@/components/ui/overview/common/ManageUsersButton"
import { UserAvatarImage } from "@/components/user/UserAvatar"
import { useAuth } from "@/contexts/AuthContext"

export default function TooltipAssignUsers({
  users,
  projectID,
  loadingUser,
  onAssign,
  onUnassign,
  hideButton,
  showCheckmark,
  offset,
}: {
  users: User[]
  projectID: number
  loadingUser?: string
  onAssign: (user: User) => void
  onUnassign?: (user: User) => void
  hideButton?: boolean
  showCheckmark?: boolean
  offset?: number
}) {
  const [filter, setFilter] = useState("")

  const { projects } = useAuth()

  // get users for the project
  const projectUsersQuery = projects!.useUserList(projectID)

  const displayUsersToAdd =
    projectUsersQuery.data?.data.filter((user) => {
      if (filter && !includesFold(user.name, filter)) {
        return false
      }
      return onUnassign || !users.map((u) => u.id).includes(user.id)
    }) ?? []

  const isLoading = !!loadingUser

  return (
    <>
      {/* Display a modal which can assign Users */}
      <Tooltip
        id="assign-users"
        place="left"
        offset={offset}
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
            label="Filter Users"
            placeholder="Daniel"
            width="100%"
            value={filter}
            onValueChange={setFilter}
            variant="bordered"
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
                    onClick={() => {
                      if (loadingUser === user.id) {
                        return
                      }
                      if (users.map((u) => u.id).includes(user.id)) {
                        onUnassign && onUnassign(user)
                      } else {
                        onAssign(user)
                      }
                    }}
                    disabled={isLoading}
                  >
                    {/* User Avatar */}
                    <UserAvatarImage
                      className="h-6 w-6 rounded-full"
                      userID={user.id}
                    />

                    {/* User Title */}
                    <span>{user.name}</span>

                    {/* Loading Spinner */}
                    {loadingUser === user.id && (
                      <ClipLoader color="orange" size="1em" />
                    )}

                    {/* Checkmark */}
                    {showCheckmark &&
                      users.map((u) => u.id).includes(user.id) && (
                        <div className="text-green-500">
                          <BsPersonAdd />
                        </div>
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

      {!hideButton && (
        <button
          data-tooltip-id="assign-users"
          className="flex flex-row items-center rounded-full border border-neutral-500 px-3 py-1 text-sm text-neutral-500"
        >
          <div className="flex flex-row items-center justify-center space-x-2">
            <BsPersonAdd />
            <div>Assign</div>
          </div>
        </button>
      )}
    </>
  )
}
