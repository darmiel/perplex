import { useMutation, useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { PropsWithChildren, useState } from "react"
import { BarLoader } from "react-spinners"

import { BackendResponse } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import { useAuth } from "@/contexts/AuthContext"

export default function Register({ children }: PropsWithChildren) {
  const { user, axios } = useAuth()

  const [userName, setUserName] = useState<string>("")

  const userNameQuery = useQuery<BackendResponse<string>, AxiosError>({
    queryKey: [{ userID: user!.uid }],
    queryFn: () => axios!.get(`/user/resolve/${user!.uid}`),
  })

  const changeNameMutation = useMutation<
    BackendResponse<string>,
    AxiosError,
    string
  >({
    mutationFn: (newName: string) =>
      axios!.put(`/user/me`, { new_name: newName }),
    onSuccess: () => {
      userNameQuery.refetch()
    },
  })

  if (userNameQuery.isLoading) {
    return (
      <>
        <BarLoader color="white" />
        <span>Loading User Information...</span>
      </>
    )
  }
  if (userNameQuery.isError) {
    if (userNameQuery.error.response?.status === 404) {
      return (
        <div className="p-10 space-y-5">
          <div>
            <h1 className="text-2xl font-bold">Please Register.</h1>
          </div>

          <div className="space-y-2">
            <label className="text-neutral-400" htmlFor="userName">
              Choose a Name
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
          <div>
            <button
              onClick={() => changeNameMutation.mutate(userName)}
              disabled={changeNameMutation.isLoading}
              className="px-4 py-2 bg-purple-600 rounded-md cursor-pointer hover:bg-purple-800"
            >
              {changeNameMutation.isLoading ? <BarLoader /> : "Register"}
            </button>
          </div>
        </div>
      )
    }
    return (
      <span className="text-red-500">
        Error: {extractErrorMessage(userNameQuery.error)}
      </span>
    )
  }

  if (!user || !axios) {
    return (
      <span className="text-red-500">
        User or Axios not found. (This is bad btw.)
      </span>
    )
  }

  return children
}
