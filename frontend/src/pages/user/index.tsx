import { Button, Input } from "@nextui-org/react"
import { useState } from "react"
import { BiSolidLogOut } from "react-icons/bi"
import { BsCheck } from "react-icons/bs"
import { BarLoader } from "react-spinners"
import { toast } from "sonner"

import { UserAvatarImage } from "@/components/user/UserAvatar"
import { useAuth } from "@/contexts/AuthContext"

export default function User() {
  const { user, users, logout } = useAuth()

  const [userName, setUserName] = useState<string>("")

  const userNameQuery = users!.useResolve(user?.uid ?? "", (name) =>
    setUserName(name),
  )

  const changeNameMutation = users!.useChangeName(user!.uid, () => {
    toast.success("Name changed!")
  })

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
        <UserAvatarImage
          userID={user.uid}
          height={512}
          width={512}
          className="h-20 w-20 rounded-full"
        />
      </div>

      <div className="space-y-5">
        <h2 className="text-4xl font-bold">User Profile</h2>

        {isUnregistered && (
          <div className="border border-red-600 bg-red-600 bg-opacity-10 p-4">
            <span className="text-red-500">
              <h2 className="text-xl">Unregistered User!</h2>
              You are not registered yet. Please choose a name. You profile will
              only be visible to other users if you are registered.
            </span>
          </div>
        )}

        <Input
          label={isUnregistered ? "Choose a Name" : "Change Name"}
          type="text"
          placeholder="Willma"
          value={userName}
          onChange={(event) => setUserName(event.target.value)}
          variant="bordered"
          endContent={
            <Button
              isIconOnly
              startContent={<BsCheck />}
              size="sm"
              isLoading={changeNameMutation.isLoading}
              onClick={() =>
                changeNameMutation.mutate({
                  newName: userName,
                })
              }
            />
          }
        />
        <Button
          color="danger"
          variant="bordered"
          startContent={<BiSolidLogOut />}
          onClick={() => logout?.()}
        >
          Logout
        </Button>
      </div>
    </div>
  )
}
