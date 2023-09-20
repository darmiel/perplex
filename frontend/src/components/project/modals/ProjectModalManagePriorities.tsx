import { Chip, Input, ScrollShadow } from "@nextui-org/react"
import clsx from "clsx"
import { useState } from "react"
import { BsCheck, BsDice5, BsPen, BsSearch, BsTrash, BsX } from "react-icons/bs"
import { toast } from "sonner"

import { Priority } from "@/api/types"
import { extractErrorMessage, includesFold } from "@/api/util"
import Button from "@/components/ui/Button"
import Hr from "@/components/ui/Hr"
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
      toast.success(`Priority #${priorityID} edited`)
      setEditMode(null)
    },
  )

  const createPriorityMut = priorities!.useCreate(projectID, ({ data }) => {
    toast.success(`Priority #${data.ID} created`)
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
    <div
      className={`w-[40rem] space-y-6 rounded-md border border-neutral-800 bg-neutral-950 p-4`}
    >
      <h1 className="text-xl font-semibold">{`Manage Priorities in Project #${projectID}`}</h1>

      <Input
        variant="bordered"
        label="Search Priority"
        onValueChange={setPriorityNameSearch}
        value={priorityNameSearch}
        autoComplete="off"
        startContent={<BsSearch />}
      />

      <ScrollShadow className="flex max-h-96 flex-col space-y-2">
        {listPrioritiesQuery.data.data
          // filter priorities by name (lower case search)
          .filter(
            (tag) =>
              !priorityNameSearch ||
              includesFold(tag.title, priorityNameSearch),
          )
          // display priorities
          .map((priority) => (
            <div
              key={priority.ID}
              className={clsx(
                "flex items-center justify-between space-x-2 rounded-md p-2",
                "transition-colors duration-150 ease-in-out hover:bg-neutral-900",
              )}
            >
              {editMode === priority.ID ? (
                <div className="flex flex-grow flex-row space-x-2">
                  <Input
                    type="text"
                    variant="bordered"
                    className="w-full"
                    placeholder="My awesome Priority"
                    onValueChange={setEditTitle}
                    value={editTitle}
                    autoComplete="off"
                  />
                  <Input
                    type="color"
                    variant="bordered"
                    className="h-11 w-24"
                    placeholder="#ff0000"
                    onChange={(event) => setEditColor(event.target.value)}
                    value={editColor}
                    autoComplete="off"
                  />
                  <Input
                    type="number"
                    variant="bordered"
                    className="w-24"
                    placeholder="0"
                    onChange={(event) =>
                      setEditWeight(Number(event.target.value))
                    }
                    value={String(editWeight)}
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Chip
                    variant="bordered"
                    style={{
                      borderColor: priority.color,
                      color: priority.color,
                    }}
                  >
                    {priority.title}
                  </Chip>
                  <span className="text-neutral-400">{priority.weight}</span>
                </div>
              )}
              <div className="space-x-2">
                {editMode === priority.ID ? (
                  <>
                    <Button style="animated" onClick={() => setEditMode(null)}>
                      <BsX />
                    </Button>
                    <Button
                      style="animated"
                      onClick={() => editPriority(priority)}
                      isLoading={editPriorityMut.isLoading}
                    >
                      <BsCheck />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      style="animated"
                      className="text-red-500"
                      onClick={() => removePriority(priority)}
                      isLoading={removePriorityMut.isLoading}
                    >
                      {confirmDelete === priority.ID ? "Confirm" : <BsTrash />}
                    </Button>
                    <Button
                      style="animated"
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
      </ScrollShadow>

      <div className="flex items-center space-x-2">
        <Input
          type="text"
          variant="bordered"
          value={createName}
          onValueChange={setCreateName}
          placeholder="My awesome Priority"
          className="w-full"
          autoComplete="off"
        />
        <Input
          type="number"
          variant="bordered"
          value={String(createWeight)}
          onChange={(e) => setCreateWeight(Number(e.target.value))}
          placeholder="0"
          className="w-36"
        />
        <Input
          startContent={
            <Button
              noBaseStyle
              style="animated"
              className="px-1 py-1"
              onClick={() => {
                const randomColor = `#${Math.floor(
                  Math.random() * 16777215,
                ).toString(16)}`
                setCreateColor(randomColor)
              }}
            >
              <BsDice5 />
            </Button>
          }
          type="color"
          variant="bordered"
          value={createColor}
          onValueChange={setCreateColor}
          placeholder="#ff0000"
          className="w-36"
          autoComplete="off"
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
    </div>
  )
}
