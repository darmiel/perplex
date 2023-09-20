import { Input, ScrollShadow } from "@nextui-org/react"
import clsx from "clsx"
import { useEffect, useState } from "react"
import { BsArrowLeft, BsArrowRight } from "react-icons/bs"
import { toast } from "sonner"

import useDebounce from "@/components/Debounce"
import Button from "@/components/ui/Button"
import Hr from "@/components/ui/Hr"
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

  const { user: loggedUser, projects: project, users } = useAuth()

  const listUsersQuery = users!.useList(query, page, true)

  // get project information to check which users are already in the project
  const projectUsersQuery = project!.useUserList(projectID)

  const addRemoveUserMutation = project!.useUserLink(
    projectID,
    (_, { link }) => {
      toast.success(
        `User successfully ${link ? "added" : "removed"} from Project.`,
      )
    },
  )

  const debounce = useDebounce(userNameSearch, 100)
  useEffect(() => {
    setPage(1)
    setQuery(debounce)
  }, [debounce])

  return (
    <div
      className={`w-[40rem] space-y-6 rounded-md border border-neutral-800 bg-neutral-950 p-4`}
    >
      <h1 className="text-xl font-semibold">Manage Users</h1>

      <Input
        variant="bordered"
        label="Search User"
        placeholder="darmiel"
        onValueChange={setUserNameSearch}
        value={userNameSearch}
        autoComplete="off"
      />

      <ScrollShadow className="flex max-h-96 flex-col space-y-2">
        {listUsersQuery.data?.data.map((user) => {
          const isAlreadyInProject = projectUsersQuery.data?.data.some(
            (projectUser) => projectUser.id === user.id,
          )
          return (
            <div
              key={user.id}
              className={clsx(
                "flex items-center justify-between rounded-md border border-transparent bg-transparent px-4 py-2",
                "transition-colors duration-150 ease-in-out hover:bg-neutral-900",
              )}
            >
              <div className="flex items-center space-x-4">
                <UserAvatar userID={user.id} />
                <div className="flex flex-col">
                  <span>{user.name}</span>
                  {isAlreadyInProject && (
                    <span className="text-neutral-500">
                      User is already in project
                    </span>
                  )}
                </div>
              </div>
              <Button
                style={isAlreadyInProject ? "animated" : "neutral"}
                disabled={loggedUser?.uid === user.id}
                onClick={() =>
                  addRemoveUserMutation.mutate({
                    userID: user.id,
                    link: !isAlreadyInProject,
                  })
                }
                isLoading={addRemoveUserMutation.isLoading}
              >
                {isAlreadyInProject ? "Remove" : "Add"} User
              </Button>
            </div>
          )
        })}
      </ScrollShadow>

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
    </div>
  )
}
