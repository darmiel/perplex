import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { BarLoader } from "react-spinners"
import Popup from "reactjs-popup"

import { BackendResponse, User } from "@/api/types"
import Button from "@/components/ui/Button"
import { CheckableCardContainer } from "@/components/ui/card/CheckableCardContainer"
import { useAuth } from "@/contexts/AuthContext"

export default function UserSelection({
  projectID,
  selectedUsers,
  saveText = "Save",
  onSave,
  isLoading = false,
  children,
}: {
  projectID: number
  selectedUsers: User[] | string[]
  saveText?: string
  onSave(users: string[]): void
  isLoading?: boolean
  children: JSX.Element
}) {
  const [open, setOpen] = useState(false)
  const [assigned, setAssigned] = useState<string[]>(
    selectedUsers.map((user) => (typeof user === "string" ? user : user.id)),
  )
  const [hasChanged, setHasChanged] = useState(false)

  const { projectUsersQueryFn, projectUsersQueryKey } = useAuth()
  const queryClient = useQueryClient()
  const projectInfoQuery = useQuery<BackendResponse<User[]>>({
    enabled: open,
    queryKey: projectUsersQueryKey!(projectID),
    queryFn: projectUsersQueryFn!(projectID),
  })

  function addUser(userID: string) {
    setHasChanged(true)
    setAssigned((old) => [...old, userID])
  }

  function removeUser(userID: string) {
    setHasChanged(true)
    setAssigned((old) => old.filter((u) => u !== userID))
  }

  return (
    <Popup
      trigger={children}
      open={open}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      contentStyle={{
        background: "none",
        border: "none",
        width: "auto",
      }}
    >
      <div className="p-1 rounded-md bg-neutral-900 border border-neutral-600 space-y-2">
        {projectInfoQuery.isLoading ? (
          <BarLoader color="white" />
        ) : (
          <>
            {projectInfoQuery.data?.data.map((user) => (
              <CheckableCardContainer
                key={user.id}
                checked={assigned.includes(user.id)}
                onToggle={(toggled) => {
                  toggled ? addUser(user.id) : removeUser(user.id)
                }}
              >
                {user.name}
              </CheckableCardContainer>
            ))}
            <Button
              className="w-full"
              style="primary"
              disabled={!hasChanged}
              isLoading={isLoading}
              onClick={() => onSave?.(assigned)}
            >
              {saveText}
            </Button>
          </>
        )}
      </div>
    </Popup>
  )
}
