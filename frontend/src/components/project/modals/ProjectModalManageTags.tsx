import { Chip, Input, ScrollShadow } from "@nextui-org/react"
import clsx from "clsx"
import { useState } from "react"
import { BsCheck, BsDice5, BsPen, BsSearch, BsTrash, BsX } from "react-icons/bs"
import { toast } from "sonner"

import { Tag } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import Button from "@/components/ui/Button"
import Hr from "@/components/ui/Hr"
import { useAuth } from "@/contexts/AuthContext"

export default function ProjectModalManageTags({
  projectID,
  onClose,
}: {
  projectID: number
  onClose?: () => void
}) {
  const [tagNameSearch, setTagNameSearch] = useState("")

  // actions
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [editMode, setEditMode] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editColor, setEditColor] = useState("")

  const [createName, setCreateName] = useState("")
  const [createColor, setCreateColor] = useState("")

  const { tags } = useAuth()

  const projectTagsQuery = tags!.useList(projectID)

  const removeTagMut = tags!.useDelete(projectID, (_, { tagID }) => {
    toast.success(`Tag #${tagID} removed from Project #${projectID}`)
    setConfirmDelete(null)
  })

  const editTagMut = tags!.useEdit(projectID, (_, { tagID }) => {
    toast.success(`Tag #${tagID} edited`)
    setEditMode(null)
  })

  const createTagMut = tags!.useCreate(projectID, ({ data }) => {
    toast.success(`Tag #${data.ID} created`)
  })

  if (projectTagsQuery.isLoading) {
    return <>Loading Tags...</>
  }
  if (projectTagsQuery.isError) {
    return (
      <>
        <strong>Error loading Tags:</strong>
        <pre>{extractErrorMessage(projectTagsQuery.error)}</pre>
      </>
    )
  }

  function removeTag(tag: Tag) {
    setEditMode(null)
    if (confirmDelete !== tag.ID) {
      setConfirmDelete(tag.ID)
      return
    }
    removeTagMut.mutate({
      tagID: tag.ID,
    })
  }

  function editTag(tag: Tag) {
    setConfirmDelete(null)
    if (editMode !== tag.ID) {
      setEditTitle(tag.title)
      setEditColor(tag.color)
      setEditMode(tag.ID)
      return
    }
    editTagMut.mutate({
      tagID: tag.ID,
      editTitle,
      editColor,
    })
  }

  return (
    <div
      className={`w-[40rem] space-y-6 rounded-md border border-neutral-800 bg-neutral-950 p-4`}
    >
      <h1 className="text-xl font-semibold">Manage Tags</h1>

      <Input
        variant="bordered"
        label="Search Tags"
        onValueChange={setTagNameSearch}
        value={tagNameSearch}
        autoComplete="off"
        startContent={<BsSearch />}
      />

      <ScrollShadow className="flex max-h-96 flex-col space-y-2">
        {projectTagsQuery.data.data
          // filter tags by name (lower case search)
          .filter(
            (tag) =>
              !tagNameSearch ||
              tag.title.toLowerCase().includes(tagNameSearch.toLowerCase()),
          )
          // display tags
          .map((tag) => (
            <div
              key={tag.ID}
              className={clsx(
                "flex items-center justify-between space-x-2 rounded-md p-2",
                "transition-colors duration-150 ease-in-out hover:bg-neutral-900",
              )}
            >
              {editMode === tag.ID ? (
                <div className="flex flex-grow flex-row space-x-2">
                  <Input
                    type="text"
                    variant="bordered"
                    className="w-full"
                    placeholder="My awesome Tag"
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
                </div>
              ) : (
                <Chip
                  variant="bordered"
                  style={{
                    borderColor: tag.color,
                    color: tag.color,
                  }}
                >
                  {tag.title}
                </Chip>
              )}
              <div className="space-x-2">
                {editMode === tag.ID ? (
                  <>
                    <Button style="animated" onClick={() => setEditMode(null)}>
                      <BsX />
                    </Button>
                    <Button
                      style="animated"
                      onClick={() => editTag(tag)}
                      isLoading={editTagMut.isLoading}
                    >
                      <BsCheck />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      style="animated"
                      className="text-red-500"
                      onClick={() => removeTag(tag)}
                      isLoading={removeTagMut.isLoading}
                    >
                      {confirmDelete === tag.ID ? "Confirm" : <BsTrash />}
                    </Button>
                    <Button
                      style="animated"
                      onClick={() => editTag(tag)}
                      isLoading={editTagMut.isLoading}
                    >
                      <BsPen />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
      </ScrollShadow>

      <div className="flex space-x-2">
        <Input
          type="text"
          variant="bordered"
          value={createName}
          onValueChange={setCreateName}
          placeholder="My awesome Tag"
          className="w-full"
          autoComplete="off"
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
          className="h-11 w-36"
          autoComplete="off"
        />
        <Button
          onClick={() =>
            createTagMut.mutate({
              title: createName,
              color: createColor,
            })
          }
          isLoading={createTagMut.isLoading}
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
