import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useEffect, useState } from "react"
import { BsArrowLeft, BsArrowRight } from "react-icons/bs"
import { toast } from "react-toastify"

import { projectUserAddVars } from "@/api/functions"
import { BackendResponse, User } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import useDebounce from "@/components/Debounce"
import Button from "@/components/ui/Button"
import Hr from "@/components/ui/Hr"
import ModalContainer from "@/components/ui/modal/ModalContainer"
import UserAvatar from "@/components/user/UserAvatar"
import { useAuth } from "@/contexts/AuthContext"

export default function ProjectModalManageUsers({
  projectID,
  onClose,
}: {
  projectID: number
  onClose?: () => void
}) {
  const [page, setPage] = useState(1)
  const [userNameSearch, setUserNameSearch] = useState("")
  const [query, setQuery] = useState("")

  const {
    user: loggedUser,
    projectUsersQueryFn,
    projectUsersQueryKey,
    userListQueryFn,
    userListQueryKey,
    projectUserAddMutFn,
    projectUserAddMutKey,
  } = useAuth()
  const debounce = useDebounce(userNameSearch, 100)
  const queryClient = useQueryClient()

  const listUsersQuery = useQuery<BackendResponse<User[]>, AxiosError>({
    queryKey: userListQueryKey!(query, page),
    queryFn: userListQueryFn!(query, page),
    keepPreviousData: true,
  })

  // get project information to check which users are already in the project
  const projectUsersQuery = useQuery<BackendResponse<User[]>>({
    queryKey: projectUsersQueryKey!(projectID),
    queryFn: projectUsersQueryFn!(projectID),
  })

  const addRemoveUserMutation = useMutation<
    BackendResponse<User>,
    AxiosError,
    projectUserAddVars
  >({
    mutationKey: projectUserAddMutKey!(projectID),
    mutationFn: projectUserAddMutFn!(projectID),
    onSuccess() {
      queryClient.invalidateQueries(projectUsersQueryKey!(projectID))
    },
    onError: (error, { add }) => {
      toast(
        <>
          <strong>Cannot {add ? "add" : "remove"} user from project</strong>
          <pre>{extractErrorMessage(error)}</pre>
        </>,
        { type: "error" },
      )
    },
  })

  useEffect(() => {
    setPage(1)
    setQuery(userNameSearch)
    queryClient.invalidateQueries(["users", page])
  }, [debounce])

  function removeUser(userID: string) {}

  function addUser(userID: string) {}

  return (
    <ModalContainer
      title={`Manage Users in Project #${projectID}`}
      className="w-[40rem]"
    >
      <div className="space-y-2">
        <label className="text-neutral-400" htmlFor="userNameSearch">
          Search User
        </label>
        <input
          id="userNameSearch"
          type="text"
          className="w-full border border-neutral-600 bg-neutral-800 rounded-lg p-2"
          placeholder="darmiel"
          onChange={(event) => setUserNameSearch(event.target.value)}
          value={userNameSearch}
        />
      </div>

      <Hr />

      <div className="flex flex-col space-y-4">
        {listUsersQuery.data?.data.map((user) => {
          const isAlreadyInProject = projectUsersQuery.data?.data.some(
            (projectUser) => projectUser.id === user.id,
          )
          return (
            <div
              key={user.id}
              className={`${
                !isAlreadyInProject ? "bg-neutral-800" : ""
              } rounded-md p-4 flex items-center justify-between border border-neutral-600`}
            >
              <div className="flex space-x-4 items-center">
                <UserAvatar userID={user.id} />
                <div className="flex flex-col">
                  <span>{user.name}</span>
                  {isAlreadyInProject && (
                    <span className="text-neutral-400">
                      User is already in project
                    </span>
                  )}
                </div>
              </div>
              <Button
                style={isAlreadyInProject ? "neutral" : "primary"}
                disabled={loggedUser?.uid === user.id}
                onClick={() =>
                  addRemoveUserMutation.mutate({
                    userID: user.id,
                    add: !isAlreadyInProject,
                  })
                }
                isLoading={addRemoveUserMutation.isLoading}
              >
                {isAlreadyInProject ? "Remove" : "Add"} User
              </Button>
            </div>
          )
        })}
      </div>

      <Hr />

      <div className="flex flex-row justify-between space-x-4">
        <Button onClick={() => onClose?.()}>Close</Button>

        <div className="flex items-center space-x-4">
          <Button
            isLoading={listUsersQuery.isFetching}
            onClick={() => setPage((page) => Math.max(1, page - 1))}
            style="secondary"
            disabled={page <= 1}
          >
            <div className="flex items-center space-x-2">
              <BsArrowLeft />
              <span>Previous</span>
            </div>
          </Button>

          <Button
            isLoading={listUsersQuery.isFetching}
            onClick={() =>
              !listUsersQuery.isPreviousData && setPage((page) => page + 1)
            }
            style="secondary"
            disabled={listUsersQuery.data?.data.length !== 5}
          >
            <div className="flex items-center space-x-2">
              <span>Next</span>
              <BsArrowRight />
            </div>
          </Button>
        </div>
      </div>
    </ModalContainer>
  )
}
