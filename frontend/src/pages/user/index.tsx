import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useState } from "react"
import { BarLoader } from "react-spinners"

import { BackendResponse } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import Button from "@/components/ui/Button"
import UserAvatar from "@/components/user/UserAvatar"
import { useAuth } from "@/contexts/AuthContext"

export default function User() {
  const { user, axios, userResolveQueryFn, userResolveQueryKey } = useAuth()

  const [userName, setUserName] = useState<string>("")

  const queryClient = useQueryClient()
  const userNameQuery = useQuery<BackendResponse<string>, AxiosError>({
    enabled: !!user,
    queryKey: userResolveQueryKey!(user!.uid),
    queryFn: userResolveQueryFn!(user!.uid),
    onSuccess(data) {
      setUserName(data.data)
    },
    retry: (failureCount, error) => {
      if (error.response?.status === 404) {
        return false
      }
      return failureCount < 3
    },
  })

  const changeNameMutation = useMutation<
    BackendResponse<string>,
    AxiosError,
    string
  >({
    mutationFn: (newName: string) =>
      axios!.put(`/user/me`, { new_name: newName }),
    onSuccess: (data) => {
      queryClient.invalidateQueries(userResolveQueryKey!(user!.uid))
    },
  })

  if (!user || !axios) {
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

  // if (userNameQuery.isError) {
  // if ( === 404) {
  return (
    <div className="p-10 border-l border-l-neutral-700">
      <div className="flex space-x-5">
        <div>
          <UserAvatar
            userID={user.uid}
            height={512}
            width={512}
            className="w-20 h-20"
          />
        </div>

        <div className="space-y-5">
          <h1 className="text-2xl font-bold">User Profile</h1>

          {isUnregistered && (
            <div className="bg-red-600 bg-opacity-10 border border-red-600 p-4">
              <span className="text-red-500">
                <h2 className="text-xl">Unregistered User!</h2>
                You are not registered yet. Please choose a name. You profile
                will only be visible to other users if you are registered.
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
              onClick={() => changeNameMutation.mutate(userName)}
            >
              {isUnregistered ? "Register" : "Change Name"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
  //   }
  //   return (
  //     <span className="text-red-500">
  //       Error: {extractErrorMessage(userNameQuery.error)}
  //     </span>
  //   )
  // }

  // return children
}
