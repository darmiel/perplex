import { Button, Chip, Input, ScrollShadow } from "@nextui-org/react"
import clsx from "clsx"
import { useState } from "react"
import {
  BsCheck,
  BsDice5,
  BsPen,
  BsSearch,
  BsTrash,
  BsTrashFill,
  BsX,
} from "react-icons/bs"
import { toast } from "sonner"

import { Priority } from "@/api/types"
import { extractErrorMessage, includesFold } from "@/api/util"
import Hr from "@/components/ui/Hr"
import ModalContainerNG from "@/components/ui/modal/ModalContainerNG"
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
    <ModalContainerNG
      title={`Manage Priorities in Project #${projectID}`}
      onClose={onClose}
    >
      <Input
        variant="bordered"
        label="Search Priority"
        onValueChange={setPriorityNameSearch}
        value={priorityNameSearch}
        autoComplete="off"
        startContent={<BsSearch />}
      />

      <Hr />

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
                    <Button
                      isIconOnly
                      startContent={<BsX />}
                      variant="bordered"
                      color="danger"
                      onClick={() => setEditMode(null)}
                    />
                    <Button
                      isIconOnly
                      startContent={<BsCheck />}
                      variant="bordered"
                      color="primary"
                      onClick={() => editPriority(priority)}
                      isLoading={editPriorityMut.isLoading}
                    />
                  </>
                ) : (
                  <>
                    <Button
                      isIconOnly
                      startContent={
                        confirmDelete === priority.ID ? (
                          <BsTrashFill />
                        ) : (
                          <BsTrash />
                        )
                      }
                      variant={
                        confirmDelete === priority.ID ? "solid" : "light"
                      }
                      color={
                        confirmDelete === priority.ID ? "danger" : "default"
                      }
                      onClick={() => removePriority(priority)}
                      isLoading={removePriorityMut.isLoading}
                    />
                    <Button
                      isIconOnly
                      startContent={<BsPen />}
                      variant="light"
                      onClick={() => editPriority(priority)}
                      isLoading={editPriorityMut.isLoading}
                    />
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
              isIconOnly
              startContent={<BsDice5 />}
              variant="light"
              className="px-1 py-1"
              onClick={() => {
                const randomColor = `#${Math.floor(
                  Math.random() * 16777215,
                ).toString(16)}`
                setCreateColor(randomColor)
              }}
            />
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
    </ModalContainerNG>
  )
}
