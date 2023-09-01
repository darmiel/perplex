import { BsTag, BsX } from "react-icons/bs"
import { ClipLoader } from "react-spinners"
import Popup from "reactjs-popup"

import { Action } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import { TagFromType } from "@/components/ui/tag/Tag"
import { useAuth } from "@/contexts/AuthContext"

export default function ActionSectionTags({ action }: { action: Action }) {
  const { actions, tags } = useAuth()

  // get tags for the project
  const projectTagsQuery = tags!.useList(action.project_id)

  const assignMut = actions!.useLinkTag(action.project_id)

  const displayTagsToAdd =
    projectTagsQuery.data?.data.filter(
      (tag) => !action.tags.map((t) => t.ID).includes(tag.ID),
    ) ?? []

  return (
    <div className="flex flex-col space-y-2">
      {action.tags.map((tag) => (
        <div key={tag.ID} className="flex justify-between items-center">
          <TagFromType tag={tag} className="w-fit" />
          <div
            className="cursor-pointer"
            onClick={() => {
              !assignMut.isLoading &&
                assignMut.mutate({
                  link: false,
                  actionID: action.ID,
                  tagID: tag.ID,
                })
            }}
          >
            {assignMut.isLoading && assignMut.variables?.tagID === tag.ID ? (
              <ClipLoader color="orange" size="1em" />
            ) : (
              <BsX />
            )}
          </div>
        </div>
      ))}
      <Popup
        trigger={
          <button className="border border-neutral-500 text-neutral-500 rounded-full text-sm px-3 py-1 flex flex-row items-center">
            <div className="flex flex-row items-center justify-center space-x-2">
              <BsTag />
              <div>Assign</div>
            </div>
          </button>
        }
        contentStyle={{
          background: "none",
          border: "none",
          width: "auto",
        }}
      >
        <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 space-y-2">
          {projectTagsQuery.isLoading ? (
            <>Loading...</>
          ) : projectTagsQuery.isError ? (
            <>
              Error: <pre>{extractErrorMessage(projectTagsQuery.error)}</pre>
            </>
          ) : displayTagsToAdd.length > 0 ? (
            displayTagsToAdd.map((tag) => (
              <button
                key={tag.ID}
                className="w-full"
                onClick={() =>
                  assignMut.mutate({
                    link: true,
                    actionID: action.ID,
                    tagID: tag.ID,
                  })
                }
                disabled={
                  assignMut.isLoading ||
                  action.tags.map((t) => t.ID).includes(tag.ID)
                }
              >
                <TagFromType tag={tag} />
              </button>
            ))
          ) : (
            <>No Tags</>
          )}
        </div>
      </Popup>
    </div>
  )
}
