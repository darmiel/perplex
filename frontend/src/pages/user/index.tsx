import { useState } from "react"
import { BarLoader } from "react-spinners"

import { extractErrorMessage } from "@/api/util"
import Button from "@/components/ui/Button"
import UserAvatar from "@/components/user/UserAvatar"
import { useAuth } from "@/contexts/AuthContext"

export default function User() {
  const { user, users } = useAuth()

  const [userName, setUserName] = useState<string>("")

  const userNameQuery = users!.useResolve(user?.uid ?? "", (name) =>
    setUserName(name),
  )

  const changeNameMutation = users!.useChangeName(user!.uid, () => {})

  if (!user) {
    return (
      <span className="text-red-500">
        User or Axios not found. (This is bad btw.)
      </span>
    )
  }

  if (userNameQuery.isLoading) {
    return (
      <>
        <BarLoader color="white" />
        <span>Loading User Information...</span>
      </>
    )
  }

  const isUnregistered =
    userNameQuery.isError && userNameQuery.error.response?.status === 404

  return (
    <div className="flex space-x-5 p-10">
      <div>
        <UserAvatar
          userID={user.uid}
          height={512}
          width={512}
          className="w-20 h-20 rounded-full"
        />
      </div>

      <div className="space-y-5">
        <h1 className="text-2xl font-bold">User Profile</h1>

        {isUnregistered && (
          <div className="bg-red-600 bg-opacity-10 border border-red-600 p-4">
            <span className="text-red-500">
              <h2 className="text-xl">Unregistered User!</h2>
              You are not registered yet. Please choose a name. You profile will
              only be visible to other users if you are registered.
            </span>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-neutral-400" htmlFor="userName">
            {isUnregistered ? "Choose a Name" : "Change Name"}
          </label>
          <input
            id="userName"
            type="text"
            className="w-full border border-neutral-600 bg-neutral-800 rounded-lg p-2"
            placeholder="Willma"
            value={userName}
            onChange={(event) => setUserName(event.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          {changeNameMutation.isError && (
            <div className="max-w-xs">
              <span className="text-red-500">
                {extractErrorMessage(changeNameMutation.error)}
              </span>
            </div>
          )}
          {changeNameMutation.isSuccess && (
            <div className="max-w-xs">
              <span className="text-green-500">Name changed!</span>
            </div>
          )}
          <Button
            isLoading={changeNameMutation.isLoading}
            onClick={() =>
              changeNameMutation.mutate({
                newName: userName,
              })
            }
          >
            {isUnregistered ? "Register" : "Change Name"}
          </Button>
        </div>
      </div>
    </div>
  )
}
