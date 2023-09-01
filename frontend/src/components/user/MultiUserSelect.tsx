import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useState } from "react"
import { BarLoader } from "react-spinners"
import { toast } from "react-toastify"
import Popup from "reactjs-popup"

import { BackendResponse, User } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import Button from "@/components/ui/Button"
import { CheckableCardContainer } from "@/components/ui/card/CheckableCardContainer"
import { useAuth } from "@/contexts/AuthContext"

export default function MultiUserSelect({
  projectID,
  meetingID,
  topicID,
  initialSelection,
  children,
}: {
  projectID: number
  meetingID: number
  topicID: number
  initialSelection: string[]
  children: JSX.Element
}) {
  const [open, setOpen] = useState(false)
  const [assigned, setAssigned] = useState<string[]>(initialSelection)
  const [hasChanged, setHasChanged] = useState(false)

  const {
    projectUsersQueryFn: projectInfoQueryFn,
    projectUsersQueryKey: projectInfoQueryKey,
    topicAssignMutFn: assignTopicMutFn,
    topicAssignMutKey: assignTopicMutKey,
  } = useAuth()
  const queryClient = useQueryClient()
  const projectInfoQuery = useQuery<BackendResponse<User[]>>({
    enabled: open,
    queryKey: projectInfoQueryKey!(projectID),
    queryFn: projectInfoQueryFn!(projectID),
  })

  const assignMutation = useMutation<
    BackendResponse,
    AxiosError,
    { userIDs: string[]; topicID: any }
  >({
    mutationKey: assignTopicMutKey!(projectID, meetingID),
    mutationFn: assignTopicMutFn!(projectID, meetingID),
    onSuccess(data) {
      toast(
        `${assigned.length} user${assigned.length !== 1 ? "s" : ""} assigned!`,
        { type: "success" },
      )
      queryClient.invalidateQueries([{ projectID }, { meetingID }, "topics"])
      queryClient.invalidateQueries([{ projectID }, { meetingID }, { topicID }])
      setOpen(false)
    },
    onError(error, { userIDs }) {
      toast(
        <>
          <strong>Cannot assign {userIDs.length} user/s:</strong>
          <pre>{extractErrorMessage(error)}</pre>
        </>,
        { type: "error" },
      )
    },
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
              isLoading={assignMutation.isLoading}
              onClick={() =>
                assignMutation.mutate({ userIDs: assigned, topicID })
              }
            >
              Assign
            </Button>
          </>
        )}
      </div>
    </Popup>
  )
}
