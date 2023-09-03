import { Divider, Input, useInput } from "@geist-ui/core"
import Link from "next/link"
import { Fragment } from "react"
import { BsGear, BsTag, BsX } from "react-icons/bs"
import { ClipLoader } from "react-spinners"
import { Tooltip } from "react-tooltip"

import { Tag } from "@/api/types"
import { extractErrorMessage, includesFold } from "@/api/util"
import Flex from "@/components/ui/layout/Flex"
import { TagFromType } from "@/components/ui/tag/Tag"
import { useAuth } from "@/contexts/AuthContext"

export default function SectionAssignTags({
  projectID,
  tags,
  onAssign,
  onUnassign,
  loadingTag,
}: {
  projectID: number
  tags: Tag[]
  onAssign: (tag: Tag) => void
  onUnassign: (tag: Tag) => void
  loadingTag?: number // the Tag ID which is loading
}) {
  const { tags: tagsDB } = useAuth()
  const { state: filterText, bindings } = useInput("")

  // get tags for the project
  const projectTagsQuery = tagsDB!.useList(projectID)

  const displayTagsToAdd =
    projectTagsQuery.data?.data.filter((tag) => {
      if (filterText && !includesFold(tag.title, filterText)) return false
      return !tags.map((t) => t.ID).includes(tag.ID)
    }) ?? []

  const isLoading = !!loadingTag

  return (
    <div className="flex flex-col space-y-2">
      {/* Display a List of Tags which can be removed */}
      {tags.map((tag) => (
        <div key={tag.ID} className="flex items-center justify-between">
          <TagFromType tag={tag} className="w-fit" />
          <button
            className="cursor-pointer"
            onClick={() => !isLoading && onUnassign(tag)}
          >
            {isLoading && loadingTag === tag.ID ? (
              <ClipLoader color="orange" size="1em" />
            ) : (
              <BsX />
            )}
          </button>
        </div>
      ))}

      {/* Display a modal which can assign Tags */}
      <Tooltip
        id="assign-tags"
        place="left"
        clickable
        openOnClick
        style={{
          backgroundColor: "black",
          borderColor: "#3f3f3f",
          borderWidth: "1px",
          borderRadius: "0.5rem",
        }}
      >
        <div className="w-72 space-y-2 py-2">
          <Flex span justify="between">
            <h3 className="font-semibold text-neutral-300">Assign Tags</h3>
            <Link href={`/project/${projectID}`}>
              <Flex
                span
                x={1}
                className="group rounded-md border border-transparent bg-neutral-800 px-2 py-1 transition duration-300 ease-in-out hover:border-neutral-800 hover:bg-transparent"
              >
                <span className="group-hover:animate-spin">
                  <BsGear />
                </span>
                <span>Manage Tags</span>
              </Flex>
            </Link>
          </Flex>
          <Input placeholder="Filter Tags" width="100%" {...bindings} />
          <Divider />

          {/* Display Tags */}
          <div className="max-h-60 space-y-2 overflow-y-auto">
            {projectTagsQuery.isLoading ? (
              <>Loading Tags...</>
            ) : projectTagsQuery.isError ? (
              <>
                Error: <pre>{extractErrorMessage(projectTagsQuery.error)}</pre>
              </>
            ) : displayTagsToAdd.length > 0 ? (
              displayTagsToAdd.map((tag, index) => (
                <Fragment key={tag.ID}>
                  {index !== 0 && <Divider />}
                  <button
                    className="group flex w-full items-center space-x-2 rounded-md bg-transparent px-2 py-2 transition duration-300 ease-in-out hover:bg-neutral-800"
                    onClick={() => loadingTag !== tag.ID && onAssign(tag)}
                    disabled={isLoading}
                  >
                    {/* Tag Color */}
                    <span
                      className={`h-4 w-4 rounded-full  ${
                        loadingTag === tag.ID
                          ? "animate-ping"
                          : "group-hover:animate-pulse"
                      }`}
                      style={{
                        backgroundColor: tag.color,
                      }}
                    ></span>

                    {/* Tag Title */}
                    <span>{tag.title}</span>
                  </button>
                </Fragment>
              ))
            ) : (
              <>No Tags</>
            )}
          </div>
        </div>
      </Tooltip>

      <button
        data-tooltip-id="assign-tags"
        className="flex flex-row items-center rounded-full border border-neutral-500 px-3 py-1 text-sm text-neutral-500"
      >
        <div className="flex flex-row items-center justify-center space-x-2">
          <BsTag />
          <div>Assign</div>
        </div>
      </button>
    </div>
  )
}
