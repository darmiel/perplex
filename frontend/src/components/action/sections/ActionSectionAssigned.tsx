import { BsPeople, BsX } from "react-icons/bs"
import { ClipLoader } from "react-spinners"
import Popup from "reactjs-popup"

import { Action } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import Button from "@/components/ui/Button"
import UserAvatar from "@/components/user/UserAvatar"
import { useAuth } from "@/contexts/AuthContext"

export default function ActionSectionAssigned({ action }: { action: Action }) {
  const {
    user: loggedUser,
    useProjectUsersQuery,
    useActionLinkUserMut,
  } = useAuth()

  // get project information to check which users are already in the project
  const projectUsersQuery = useProjectUsersQuery!(action.project_id)
  const assignMut = useActionLinkUserMut!(action.project_id)

  return (
    <div className="flex flex-col space-y-2">
      {action.assigned_users.map((user) => (
        <div key={user.id} className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-5 w-5">
              <UserAvatar userID={user.id} />
            </div>
            <span
              className={user.id === loggedUser?.uid ? "text-primary-500" : ""}
            >
              {user.name}
            </span>
          </div>
          <div
            className="cursor-pointer"
            onClick={() => {
              !assignMut.isLoading &&
                assignMut.mutate({
                  link: false,
                  userID: user.id,
                  actionID: action.ID,
                })
            }}
          >
            {assignMut.isLoading && assignMut.variables?.userID === user.id ? (
              <ClipLoader color="orange" size="1em" />
            ) : (
              <BsX />
            )}
          </div>
        </div>
      ))}
      <Popup
        trigger={
          <button className="border border-neutral-500 text-neutral-500 rounded-full text-sm px-3 py-1 flex flex-row items-center">
            <div className="flex flex-row items-center justify-center space-x-2">
              <BsPeople />
              <div>Assign</div>
            </div>
          </button>
        }
        contentStyle={{
          background: "none",
          border: "none",
          width: "auto",
        }}
      >
        <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 space-y-2">
          {projectUsersQuery.isLoading ? (
            <>Loading...</>
          ) : projectUsersQuery.isError ? (
            <>
              Error: <pre>{extractErrorMessage(projectUsersQuery.error)}</pre>
            </>
          ) : (
            projectUsersQuery.data?.data.map((user) => (
              <Button
                key={user.id}
                className="w-full"
                onClick={() =>
                  assignMut.mutate({
                    link: true,
                    userID: user.id,
                    actionID: action.ID,
                  })
                }
                disabled={
                  assignMut.isLoading ||
                  action.assigned_users.map((u) => u.id).includes(user.id)
                }
              >
                <div className="flex flex-row items-center space-x-4">
                  <div className="flex flex-row items-center space-x-2">
                    <div className="h-5 w-5">
                      <UserAvatar userID={user.id} />
                    </div>
                    <div>{user.name}</div>
                  </div>
                </div>
              </Button>
            ))
          )}
        </div>
      </Popup>
    </div>
  )
}
