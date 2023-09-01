import { useState } from "react"
import { BsCheck, BsPen, BsTrash, BsX } from "react-icons/bs"
import { toast } from "react-toastify"

import { Tag } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import Button from "@/components/ui/Button"
import Hr from "@/components/ui/Hr"
import ModalContainer from "@/components/ui/modal/ModalContainer"
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
    toast(`Tag #${tagID} removed from Project #${projectID}`, {
      type: "success",
    })
    setConfirmDelete(null)
  })

  const editTagMut = tags!.useEdit(projectID, (_, { tagID }) => {
    toast(`Tag #${tagID} edited`, {
      type: "success",
    })
    setEditMode(null)
  })

  const createTagMut = tags!.useCreate(projectID, ({ data }) => {
    toast(<>Tag (#{data.ID}) created</>, {
      type: "success",
    })
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
    <ModalContainer
      title={`Manage Tags in Project #${projectID}`}
      className="w-[40rem]"
    >
      <div className="space-y-2">
        <label className="text-neutral-400" htmlFor="tagSearch">
          Search Tag
        </label>
        <input
          id="tagSearch"
          type="text"
          className="w-full border border-neutral-600 bg-neutral-800 rounded-lg p-2"
          placeholder="My awesome Tag"
          onChange={(event) => setTagNameSearch(event.target.value)}
          value={tagNameSearch}
        />
      </div>

      <Hr />

      <div className="flex flex-col space-y-4">
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
              className={`rounded-md p-4 flex items-center justify-between border`}
              style={{
                borderColor: tag.color,
              }}
            >
              <div>
                {editMode === tag.ID ? (
                  <div className="flex flex-row space-x-2">
                    <input
                      type="text"
                      className="w-full border border-neutral-600 bg-neutral-800 rounded-lg p-2"
                      placeholder="My awesome Tag"
                      onChange={(event) => setEditTitle(event.target.value)}
                      value={editTitle}
                    />
                    <input
                      type="text"
                      className="w-1/2 border border-neutral-600 bg-neutral-800 rounded-lg p-2"
                      placeholder="#ff0000"
                      onChange={(event) => setEditColor(event.target.value)}
                      value={editColor}
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <h2
                      className="px-4 py-2 rounded-md text-white"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.title}
                    </h2>
                    <span className="text-neutral-400">{tag.color}</span>
                  </div>
                )}
              </div>
              <div className="space-x-2">
                {editMode === tag.ID ? (
                  <>
                    <Button style="neutral" onClick={() => setEditMode(null)}>
                      <BsX />
                    </Button>
                    <Button
                      style="primary"
                      onClick={() => editTag(tag)}
                      isLoading={editTagMut.isLoading}
                    >
                      <BsCheck />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      style="neutral"
                      onClick={() => removeTag(tag)}
                      isLoading={removeTagMut.isLoading}
                    >
                      {confirmDelete === tag.ID ? "Confirm" : <BsTrash />}
                    </Button>
                    <Button
                      style="secondary"
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
          className="w-1/2 border border-neutral-600 bg-neutral-800 rounded-lg p-2"
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
    </ModalContainer>
  )
}
