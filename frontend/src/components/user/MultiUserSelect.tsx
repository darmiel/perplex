import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useState } from "react"
import { BarLoader } from "react-spinners"
import { toast } from "react-toastify"
import Popup from "reactjs-popup"

import { BackendResponse } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import { useAuth } from "@/contexts/AuthContext"

import { SimpleCheckBoxCard } from "../controls/card/CheckBoxCard"
import { User } from "../topic/TopicList"

export default function MultiUserSelect({
  projectID,
  meetingID,
  topicID,
  initialSelection,
  children,
}: {
  projectID: string
  meetingID: string
  topicID: string
  initialSelection: string[]
  children: JSX.Element
}) {
  const [open, setOpen] = useState(false)
  const [assigned, setAssigned] = useState<string[]>(initialSelection)
  const [hasChanged, setHasChanged] = useState(false)

  const { axios } = useAuth()
  const queryClient = useQueryClient()
  const projectInfoQuery = useQuery<BackendResponse<User[]>>({
    enabled: open,
    queryKey: [{ projectID }, "users"],
    queryFn: async () => (await axios!.get(`/project/${projectID}/users`)).data,
  })

  const assignMutation = useMutation<BackendResponse, AxiosError, string[]>({
    mutationKey: [{ projectID }, "users-assign"],
    mutationFn: async (userIDs: string[]) =>
      (
        await axios!.post(
          `/project/${projectID}/meeting/${meetingID}/topic/${topicID}/assign`,
          {
            assigned_users: userIDs,
          },
        )
      ).data,
    onSuccess(data) {
      toast(
        `${assigned.length} user${assigned.length !== 1 ? "s" : ""} assigned!`,
        { type: "success" },
      )
      queryClient.invalidateQueries([{ projectID }, { meetingID }, "topics"])
      queryClient.invalidateQueries([{ projectID }, { meetingID }, { topicID }])
      setOpen(false)
    },
    onError(error, variables) {
      toast(
        <>
          <strong>Cannot assign {variables.length} user/s:</strong>
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
      closeOnDocumentClick={false}
      closeOnEscape={false}
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
              <SimpleCheckBoxCard
                key={user.id}
                checked={assigned.includes(user.id)}
                onToggle={(toggled) => {
                  toggled ? addUser(user.id) : removeUser(user.id)
                }}
              >
                {user.name}
              </SimpleCheckBoxCard>
            ))}
            <button
              className={`${
                hasChanged ? "bg-purple-500" : "bg-neutral-700"
              } py-1 w-full rounded-md`}
              onClick={() => assignMutation.mutate(assigned)}
            >
              {assignMutation.isLoading ? "Assigning..." : "Save"}
            </button>
          </>
        )}
      </div>
    </Popup>
  )
}
