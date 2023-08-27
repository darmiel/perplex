import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { BsTag, BsX } from "react-icons/bs"
import { ClipLoader } from "react-spinners"
import { toast } from "react-toastify"
import Popup from "reactjs-popup"

import { Action, BackendResponse, Tag } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import { TagFromType } from "@/components/ui/tag/Tag"
import { useAuth } from "@/contexts/AuthContext"

export default function ActionSectionTags({ action }: { action: Action }) {
  const { axios } = useAuth()
  const queryClient = useQueryClient()

  // get tags for the project
  const projectTagsQuery = useQuery<BackendResponse<Tag[]>>({
    queryKey: [{ projectID: action.project_id }, "tags"],
    queryFn: async () =>
      (await axios!.get(`/project/${action.project_id}/tag`)).data,
  })

  const assignMut = useMutation<
    BackendResponse<never>,
    AxiosError,
    { assign: boolean; tagID: number }
  >({
    mutationKey: [{ actionID: action.ID }, "assign-tag-mut"],
    mutationFn: async ({ assign, tagID }) =>
      (
        await axios![assign ? "post" : "delete"](
          `/project/${action.project_id}/action/${action.ID}/tag/${tagID}`,
        )
      ).data,
    onSuccess: (_, { assign }) => {
      queryClient.invalidateQueries([{ actionID: String(action.ID) }])
      queryClient.invalidateQueries([
        { projectID: String(action.project_id) },
        "actions",
      ])
    },
    onError(err, { assign }) {
      toast(
        <>
          <strong>Failed to {assign ? "assign" : "unassign"} Tag</strong>
          <pre>{extractErrorMessage(err)}</pre>
        </>,
        { type: "error" },
      )
    },
  })

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
                assignMut.mutate({ assign: false, tagID: tag.ID })
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
                  assignMut.mutate({ assign: true, tagID: tag.ID })
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
