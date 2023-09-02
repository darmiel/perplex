import { useState } from "react"
import { BsCheck, BsPen, BsTrash, BsX } from "react-icons/bs"
import { toast } from "sonner"

import { Priority } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import Button from "@/components/ui/Button"
import Hr from "@/components/ui/Hr"
import ModalContainer from "@/components/ui/modal/ModalContainer"
import { useAuth } from "@/contexts/AuthContext"

export default function ProjectModalManagePriorities({
  projectID,
  onClose,
}: {
  projectID: number
  onClose?: () => void
}) {
  const [priorityNameSearch, setPriorityNameSearch] = useState("")

  // actions
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [editMode, setEditMode] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editColor, setEditColor] = useState("")
  const [editWeight, setEditWeight] = useState(0)

  const [createName, setCreateName] = useState("")
  const [createColor, setCreateColor] = useState("")
  const [createWeight, setCreateWeight] = useState(0)

  const { priorities } = useAuth()

  const listPrioritiesQuery = priorities!.useList(projectID)

  const removePriorityMut = priorities!.useDelete(
    projectID,
    (_, { priorityID }) => {
      toast.success(
        `Priority #${priorityID} removed from Project #${projectID}`,
      )
      setConfirmDelete(null)
    },
  )

  const editPriorityMut = priorities!.useEdit(
    projectID,
    (_, { priorityID }) => {
      toast(`Priority #${priorityID} edited`, {
        type: "success",
      })
      setEditMode(null)
    },
  )

  const createPriorityMut = priorities!.useCreate(projectID, ({ data }) => {
    toast(<>Priority #{data.ID} created</>, {
      type: "success",
    })
    setCreateName("")
    setCreateColor("")
    setCreateWeight(0)
  })

  if (listPrioritiesQuery.isLoading) {
    return <>Loading Priorities...</>
  }
  if (listPrioritiesQuery.isError) {
    return (
      <>
        <strong>Error loading Priorities:</strong>
        <pre>{extractErrorMessage(listPrioritiesQuery.error)}</pre>
      </>
    )
  }

  function removePriority(priority: Priority) {
    setEditMode(null)
    if (confirmDelete !== priority.ID) {
      setConfirmDelete(priority.ID)
      return
    }
    removePriorityMut.mutate({
      priorityID: priority.ID,
    })
  }

  function editPriority(priority: Priority) {
    setConfirmDelete(null)
    if (editMode !== priority.ID) {
      setEditTitle(priority.title)
      setEditColor(priority.color)
      setEditWeight(priority.weight)
      setEditMode(priority.ID)
      return
    }
    editPriorityMut.mutate({
      priorityID: priority.ID,
      editTitle,
      editColor,
      editWeight,
    })
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
        {listPrioritiesQuery.data.data
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
                      onChange={(event) => setEditTitle(event.target.value)}
                      value={editTitle}
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
          onClick={() =>
            createPriorityMut.mutate({
              title: createName,
              color: createColor,
              weight: createWeight,
            })
          }
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
