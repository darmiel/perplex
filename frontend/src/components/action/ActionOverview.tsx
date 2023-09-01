import { forwardRef, useState } from "react"
import ReactDatePicker from "react-datepicker"
import {
  BsBookmarkStarFill,
  BsBookmarkX,
  BsCalendar,
  BsPen,
} from "react-icons/bs"

import { Action } from "@/api/types"
import Button from "@/components/ui/Button"
import { RelativeDate } from "@/components/ui/DateString"
import Hr from "@/components/ui/Hr"
import OverviewContainer from "@/components/ui/overview/OverviewContainer"
import OverviewContent from "@/components/ui/overview/OverviewContent"
import OverviewSection from "@/components/ui/overview/OverviewSection"
import OverviewSide from "@/components/ui/overview/OverviewSide"
import OverviewTitle from "@/components/ui/overview/OverviewTitle"
import { PriorityTag } from "@/components/ui/tag/Tag"
import RenderMarkdown from "@/components/ui/text/RenderMarkdown"
import { useAuth } from "@/contexts/AuthContext"

import "react-datepicker/dist/react-datepicker.css"

import Head from "next/head"
import { toast } from "react-toastify"

import ActionTag from "@/components/action/ActionTag"
import ActionSectionAssigned from "@/components/action/sections/ActionSectionAssigned"
import ActionSectionTags from "@/components/action/sections/ActionSectionTags"
import ActionSectionTopics from "@/components/action/sections/ActionSectionTopics"
import CommentSuite from "@/components/comment/CommentSuite"
import DurationTag from "@/components/ui/DurationTag"

export default function ActionOverview({ action }: { action: Action }) {
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editDueDate, setEditDueDate] = useState<string>("")
  const [editPriorityID, setEditPriorityID] = useState<number>(0)

  const [isEdit, setIsEdit] = useState(false)

  const { priorities, actions } = useAuth()

  const projectPrioritiesQuery = priorities!.useList(action.project_id)

  const actionEditMut = actions!.useEdit(
    action.project_id,
    (_, { actionID }) => {
      toast(`Action ${actionID} updated`, { type: "success" })
      setIsEdit(false)
    },
  )

  const actionStatusMut = actions!.useStatus(action.project_id, () => {})

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
  const isClosed = !!action.closed_at.Valid
  const dueDate = action.due_date?.Valid
    ? new Date(action.due_date.Time)
    : undefined

  return (
    <div className="flex flex-col">
      <Head>
        <title>Perplex - A# {action.title}</title>
      </Head>
      <OverviewTitle
        creatorID={action.creator_id}
        title={action.title}
        titleID={action.ID}
        createdAt={new Date(action.CreatedAt)}
        setEditTitle={setEditTitle}
        isEdit={isEdit}
        tag={<ActionTag action={action} />}
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
              dueDate && (
                <div className="w-fit px-2 py-1 text-sm flex space-x-2 items-center bg-neutral-700 rounded-md">
                  <BsCalendar />
                  <span>
                    <RelativeDate date={dueDate} />
                  </span>
                  <DurationTag date={dueDate} />
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

          <CommentSuite
            projectID={action.project_id}
            commentType="action"
            commentEntityID={action.ID}
          />
        </OverviewContent>
        <OverviewSide className="w-3/12">
          <OverviewSection name="Actions">
            {!isEdit ? (
              <div className="flex space-x-2">
                <Button
                  className="w-full text-sm"
                  icon={<BsPen />}
                  onClick={() => enterEdit()}
                  disabled={!isOwner}
                >
                  Edit
                </Button>
                <Button
                  className="w-full text-sm"
                  style={isClosed ? "secondary" : "primary"}
                  icon={isClosed ? <BsBookmarkX /> : <BsBookmarkStarFill />}
                  onClick={() =>
                    actionStatusMut.mutate({
                      actionID: action.ID,
                      closed: !isClosed,
                    })
                  }
                  isLoading={actionStatusMut.isLoading}
                >
                  {!isClosed ? "Close" : "Reopen"}
                </Button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Button
                  className="w-1/2 text-sm"
                  style="primary"
                  isLoading={actionEditMut.isLoading}
                  onClick={() =>
                    actionEditMut.mutate({
                      actionID: action.ID,
                      title: editTitle,
                      description: editDescription,
                      due_date: editDueDate,
                      priority_id: editPriorityID,
                    })
                  }
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
          <OverviewSection name="Assigned" badge={action.assigned_users.length}>
            <ActionSectionAssigned action={action} />
          </OverviewSection>
          <OverviewSection name="Tags" badge={action.tags.length}>
            <ActionSectionTags action={action} />
          </OverviewSection>
          <OverviewSection name="Linked Topics" badge={action.topics.length}>
            <ActionSectionTopics action={action} />
          </OverviewSection>
        </OverviewSide>
      </OverviewContainer>
    </div>
  )
}
