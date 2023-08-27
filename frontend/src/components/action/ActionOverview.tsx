import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { forwardRef, useState } from "react"
import ReactDatePicker from "react-datepicker"
import {
  BsBookmarkStar,
  BsBookmarkStarFill,
  BsCalendar,
  BsPen,
} from "react-icons/bs"

import { Action, BackendResponse, Priority } from "@/api/types"
import Button from "@/components/ui/Button"
import { RelativeDate } from "@/components/ui/DateString"
import Hr from "@/components/ui/Hr"
import OverviewContainer from "@/components/ui/overview/OverviewContainer"
import OverviewContent from "@/components/ui/overview/OverviewContent"
import OverviewSection from "@/components/ui/overview/OverviewSection"
import OverviewSide from "@/components/ui/overview/OverviewSide"
import OverviewTitle from "@/components/ui/overview/OverviewTitle"
import Tag, { PriorityTag } from "@/components/ui/tag/Tag"
import RenderMarkdown from "@/components/ui/text/RenderMarkdown"
import { useAuth } from "@/contexts/AuthContext"

import "react-datepicker/dist/react-datepicker.css"

import { toast } from "react-toastify"

import { extractErrorMessage } from "@/api/util"
import ActionSectionAssigned from "@/components/action/sections/ActionSectionAssigned"
import ActionSectionTags from "@/components/action/sections/ActionSectionTags"
import ActionSectionTopics from "@/components/action/sections/ActionSectionTopics"

// TODO: remove duplicate
const tags = {
  open: {
    icon: <BsBookmarkStar />,
    text: "Open",
    className: "bg-green-600 text-white",
  },
  close: {
    icon: <BsBookmarkStarFill />,
    text: "Closed",
    className: "bg-red-600 text-white",
  },
}

export default function ActionOverview({ action }: { action: Action }) {
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editDueDate, setEditDueDate] = useState<string>("")
  const [editPriorityID, setEditPriorityID] = useState<number | null>(null)

  const [isEdit, setIsEdit] = useState(false)

  const { axios } = useAuth()
  const queryClient = useQueryClient()

  const projectPrioritiesQuery = useQuery<BackendResponse<Priority[]>>({
    queryKey: [{ projectID: action.project_id }, "priorities"],
    queryFn: async () =>
      (await axios!.get(`/project/${action.project_id}/priority`)).data,
  })

  const actionUpdateMut = useMutation<BackendResponse<never>, AxiosError>({
    mutationKey: [{ actionID: action.ID }, "update-mut"],
    mutationFn: async () =>
      (
        await axios!.put(`/project/${action.project_id}/action/${action.ID}`, {
          title: editTitle,
          description: editDescription,
          due_date: editDueDate ? new Date(editDueDate) : null,
          priority_id: editPriorityID,
        })
      ).data,
    onSuccess: () => {
      toast(`Action ${action.ID} updated`, { type: "success" })
      queryClient.invalidateQueries([{ actionID: String(action.ID) }])
      queryClient.invalidateQueries([
        { projectID: String(action.project_id) },
        "actions",
      ])
      setIsEdit(false)
    },
    onError(err) {
      toast(
        <>
          <strong>Failed to update action</strong>
          <pre>{extractErrorMessage(err)}</pre>
        </>,
        { type: "error" },
      )
    },
  })

  function enterEdit() {
    setEditTitle(action.title)
    setEditDescription(action.description)
    setEditDueDate(action.due_date.Valid ? action.due_date.Time : "")
    setEditPriorityID(action.priority_id || 0)
    setIsEdit(true)
  }

  // I really tried to type this, but it's just too much work
  // and I don't have the time to do it
  // @ts-ignore
  // eslint-disable-next-line
  const PickerCustomInput = forwardRef(({ value, onClick }, ref) => (
    <button
      className="w-full border border-neutral-600 bg-neutral-800 rounded-lg p-2"
      onClick={onClick}
      // @ts-ignore
      ref={ref}
    >
      {value}
    </button>
  ))

  const isOwner = true
  const tag = tags[action.closed_at.Valid ? "close" : "open"]

  return (
    <div className="flex flex-col">
      <OverviewTitle
        creatorID={action.creator_id}
        title={action.title}
        titleID={action.ID}
        createdAt={new Date(action.CreatedAt)}
        setEditTitle={setEditTitle}
        isEdit={isEdit}
        tag={
          <Tag className={tag.className}>
            <div>{tag.icon}</div>
            <div>{tag.text}</div>
          </Tag>
        }
      />

      <OverviewContainer>
        <OverviewContent>
          <div className="flex space-x-2 items-center mb-4">
            {/* Priority Edit */}
            {isEdit ? (
              <select
                className="w-fit bg-transparent"
                defaultValue={action.priority_id}
                onChange={(e) => setEditPriorityID(Number(e.target.value))}
              >
                <option value="0">No Priority</option>
                {projectPrioritiesQuery.data?.data.map((priority) => (
                  <option key={priority.ID} value={priority.ID}>
                    {priority.title}
                  </option>
                ))}
              </select>
            ) : (
              !!action.priority_id && (
                <PriorityTag priority={action.priority!} />
              )
            )}

            {/* Due Date Edit */}
            {isEdit ? (
              <>
                <ReactDatePicker
                  selected={editDueDate ? new Date(editDueDate) : undefined}
                  onChange={(date) =>
                    setEditDueDate((old) => date?.toString() || old)
                  }
                  showTimeSelect
                  dateFormat="Pp"
                  customInput={<PickerCustomInput />}
                />
                <Button style="neutral" onClick={() => setEditDueDate("")}>
                  No Due Date
                </Button>
              </>
            ) : (
              action.due_date?.Valid && (
                <div className="w-fit px-2 py-1 text-sm flex space-x-2 items-center bg-neutral-700 rounded-md">
                  <BsCalendar />
                  <span>
                    <RelativeDate date={new Date(action.due_date.Time)} />
                  </span>
                </div>
              )
            )}
          </div>

          {/* Description Edit */}
          <div className="text-neutral-500 p-2 bg-neutral-900">
            {isEdit ? (
              <textarea
                className="w-full h-40 bg-transparent"
                defaultValue={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            ) : (
              <RenderMarkdown markdown={action.description} />
            )}
          </div>

          <Hr className="mt-4 mb-6" />

          <ActionSectionTopics action={action} />
        </OverviewContent>
        <OverviewSide>
          <OverviewSection name="Actions">
            {!isEdit ? (
              <Button
                className="w-full text-sm"
                icon={<BsPen />}
                onClick={() => enterEdit()}
                disabled={!isOwner}
              >
                Edit Action
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button
                  className="w-1/2 text-sm"
                  style="primary"
                  isLoading={actionUpdateMut.isLoading}
                  onClick={() => actionUpdateMut.mutate()}
                >
                  Save
                </Button>
                <Button
                  className="w-1/2 text-sm"
                  style="neutral"
                  onClick={() => setIsEdit(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </OverviewSection>
          <OverviewSection name="Assigned">
            <ActionSectionAssigned action={action} />
          </OverviewSection>
          <OverviewSection name="Tags">
            <ActionSectionTags action={action} />
          </OverviewSection>
        </OverviewSide>
      </OverviewContainer>
    </div>
  )
}
