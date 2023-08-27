import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useState } from "react"
import { BsCheck, BsPen, BsTrash, BsX } from "react-icons/bs"
import { toast } from "react-toastify"

import { BackendResponse, Priority } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import Button from "@/components/ui/Button"
import Hr from "@/components/ui/Hr"
import ModalContainer from "@/components/ui/modal/ModalContainer"
import { useAuth } from "@/contexts/AuthContext"

export default function ProjectModalManagePriorities({
  projectID,
  onClose,
}: {
  projectID: string | number
  onClose?: () => void
}) {
  const [priorityNameSearch, setPriorityNameSearch] = useState("")

  // actions
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [editMode, setEditMode] = useState<number | null>(null)
  const [editName, setEditName] = useState("")
  const [editColor, setEditColor] = useState("")
  const [editWeight, setEditWeight] = useState(0)

  const [createName, setCreateName] = useState("")
  const [createColor, setCreateColor] = useState("")
  const [createWeight, setCreateWeight] = useState(0)

  const { axios } = useAuth()
  const queryClient = useQueryClient()

  const projectPrioritiesQuery = useQuery<BackendResponse<Priority[]>>({
    queryKey: [{ projectID }, "priorities"],
    queryFn: async () =>
      (await axios!.get(`/project/${projectID}/priority`)).data,
  })

  const removePriorityMut = useMutation<BackendResponse, AxiosError, number>({
    mutationFn: async (priorityID) =>
      (await axios!.delete(`/project/${projectID}/priority/${priorityID}`))
        .data,
    onSuccess(_, tagID) {
      toast(`Priority #${tagID} removed from Project #${projectID}`, {
        type: "success",
      })
      queryClient.invalidateQueries([{ projectID }, "priorities"])
      setConfirmDelete(null)
    },
    onError(err) {
      toast(
        <>
          <strong>Failed to remove Priority from Project</strong>
          <pre>{extractErrorMessage(err)}</pre>
        </>,
        { type: "error" },
      )
    },
  })

  const editPriorityMut = useMutation<BackendResponse, AxiosError, number>({
    mutationFn: async (priorityID) =>
      (
        await axios!.put(`/project/${projectID}/priority/${priorityID}`, {
          title: editName,
          color: editColor,
          weight: editWeight,
        })
      ).data,
    onSuccess(_, priorityID) {
      toast(`Priority #${priorityID} edited`, {
        type: "success",
      })
      queryClient.invalidateQueries([{ projectID }, "priorities"])
      setEditMode(null)
    },
    onError(err) {
      toast(
        <>
          <strong>Failed to edit Priority</strong>
          <pre>{extractErrorMessage(err)}</pre>
        </>,
        { type: "error" },
      )
    },
  })

  const createPriorityMut = useMutation<BackendResponse<Priority>, AxiosError>({
    mutationFn: async () =>
      (
        await axios!.post(`/project/${projectID}/priority`, {
          title: createName,
          color: createColor,
          weight: createWeight,
        })
      ).data,
    onSuccess(data) {
      toast(
        <>
          Priority <strong>{createName}</strong> (#{data.data.ID}) created
        </>,
        {
          type: "success",
        },
      )
      queryClient.invalidateQueries([{ projectID }, "priorities"])
      setCreateName("")
      setCreateColor("")
      setCreateWeight(0)
    },
    onError(err) {
      toast(
        <>
          <strong>Failed to create Priority</strong>
          <pre>{extractErrorMessage(err)}</pre>
        </>,
        { type: "error" },
      )
    },
  })

  if (projectPrioritiesQuery.isLoading) {
    return <>Loading Priorities...</>
  }
  if (projectPrioritiesQuery.isError) {
    return (
      <>
        <strong>Error loading Priorities:</strong>
        <pre>{extractErrorMessage(projectPrioritiesQuery.error)}</pre>
      </>
    )
  }

  function removePriority(priority: Priority) {
    setEditMode(null)
    if (confirmDelete !== priority.ID) {
      setConfirmDelete(priority.ID)
      return
    }
    removePriorityMut.mutate(priority.ID)
  }

  function editPriority(priority: Priority) {
    setConfirmDelete(null)
    if (editMode !== priority.ID) {
      setEditName(priority.title)
      setEditColor(priority.color)
      setEditWeight(priority.weight)
      setEditMode(priority.ID)
      return
    }
    editPriorityMut.mutate(priority.ID)
  }

  return (
    <ModalContainer
      title={`Manage Priorities in Project #${projectID}`}
      className="w-[40rem]"
    >
      <div className="space-y-2">
        <label className="text-neutral-400" htmlFor="prioritySearch">
          Search Priority
        </label>
        <input
          id="prioritySearch"
          type="text"
          className="w-full border border-neutral-600 bg-neutral-800 rounded-lg p-2"
          placeholder="Urgent"
          onChange={(event) => setPriorityNameSearch(event.target.value)}
          value={priorityNameSearch}
        />
      </div>

      <Hr />

      <div className="flex flex-col space-y-4">
        {projectPrioritiesQuery.data.data
          // filter priorities by name (lower case search)
          .filter(
            (tag) =>
              !priorityNameSearch ||
              tag.title
                .toLowerCase()
                .includes(priorityNameSearch.toLowerCase()),
          )
          // display priorities
          .map((priority) => (
            <div
              key={priority.ID}
              className={`rounded-md p-4 flex items-center justify-between border`}
              style={{
                borderColor: priority.color || "gray",
              }}
            >
              <div className="w-2/3">
                {editMode === priority.ID ? (
                  <div className="flex flex-row space-x-2">
                    <input
                      type="text"
                      className="w-full border border-neutral-600 bg-neutral-800 rounded-lg p-2"
                      placeholder="My awesome Priority"
                      onChange={(event) => setEditName(event.target.value)}
                      value={editName}
                    />
                    <input
                      type="text"
                      className="w-1/4 border border-neutral-600 bg-neutral-800 rounded-lg p-2"
                      placeholder="#ff0000"
                      onChange={(event) => setEditColor(event.target.value)}
                      value={editColor}
                    />
                    <input
                      type="number"
                      className="w-1/4 border border-neutral-600 bg-neutral-800 rounded-lg p-2"
                      placeholder="0"
                      onChange={(event) =>
                        setEditWeight(Number(event.target.value))
                      }
                      value={editWeight}
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <h2
                      className="px-4 py-2 rounded-md text-white"
                      style={{ backgroundColor: priority.color || "gray" }}
                    >
                      {priority.title}
                    </h2>
                    <span className="text-neutral-400">{priority.color}</span>
                    <span className="text-primary-400">{priority.weight}</span>
                  </div>
                )}
              </div>
              <div className="space-x-2">
                {editMode === priority.ID ? (
                  <>
                    <Button style="neutral" onClick={() => setEditMode(null)}>
                      <BsX />
                    </Button>
                    <Button
                      style="primary"
                      onClick={() => editPriority(priority)}
                      isLoading={editPriorityMut.isLoading}
                    >
                      <BsCheck />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      style="neutral"
                      onClick={() => removePriority(priority)}
                      isLoading={removePriorityMut.isLoading}
                    >
                      {confirmDelete === priority.ID ? "Confirm" : <BsTrash />}
                    </Button>
                    <Button
                      style="secondary"
                      onClick={() => editPriority(priority)}
                      isLoading={editPriorityMut.isLoading}
                    >
                      <BsPen />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
      </div>

      <div className="flex space-x-2">
        <input
          type="text"
          value={createName}
          onChange={(e) => setCreateName(e.target.value)}
          placeholder="My awesome Tag"
          className="w-full border border-neutral-600 bg-neutral-800 rounded-lg p-2"
        />
        <input
          type="text"
          value={createColor}
          onChange={(e) => setCreateColor(e.target.value)}
          placeholder="#ff0000"
          className="w-1/4 border border-neutral-600 bg-neutral-800 rounded-lg p-2"
        />
        <input
          type="number"
          value={createWeight}
          onChange={(e) => setCreateWeight(Number(e.target.value))}
          placeholder="0"
          className="w-1/4 border border-neutral-600 bg-neutral-800 rounded-lg p-2"
        />
        <Button
          onClick={() => createPriorityMut.mutate()}
          isLoading={createPriorityMut.isLoading}
        >
          Create
        </Button>
      </div>
      <Hr />

      <div className="flex flex-row justify-between space-x-4">
        <Button onClick={() => onClose?.()}>Close</Button>
      </div>
    </ModalContainer>
  )
}
