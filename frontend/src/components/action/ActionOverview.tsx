import { useState } from "react"
import ReactDatePicker from "react-datepicker"
import {
  BsBookmarkStarFill,
  BsBookmarkX,
  BsCalendar,
  BsHouse,
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
import RenderMarkdown from "@/components/ui/text/RenderMarkdown"
import { useAuth } from "@/contexts/AuthContext"

import "react-datepicker/dist/react-datepicker.css"

import { Breadcrumbs } from "@geist-ui/core"
import Head from "next/head"
import Link from "next/link"
import { toast } from "sonner"

import { PickerCustomInput } from "@/api/util"
import ActionTag from "@/components/action/ActionTag"
import ActionSectionAssigned from "@/components/action/sections/ActionSectionAssigned"
import ActionSectionTopics from "@/components/action/sections/ActionSectionTopics"
import CommentSuite from "@/components/comment/CommentSuite"
import PriorityPickerWithEdit from "@/components/project/priority/PriorityPickerWithEdit"
import ResolveProjectName from "@/components/resolve/ResolveProjectName"
import DurationTag from "@/components/ui/DurationTag"
import SectionAssignTags from "@/components/ui/overview/common/SectionAssignTags"

export default function ActionOverview({ action }: { action: Action }) {
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editDueDate, setEditDueDate] = useState<string>("")
  const [editPriorityID, setEditPriorityID] = useState<number>(0)

  const [isEdit, setIsEdit] = useState(false)

  const { actions } = useAuth()

  const actionEditMut = actions!.useEdit(action.project_id, () =>
    setIsEdit(false),
  )

  const actionStatusMut = actions!.useStatus(action.project_id, () => {})

  const linkTagMut = actions!.useLinkTag(action.project_id)

  function enterEdit() {
    setEditTitle(action.title)
    setEditDescription(action.description)
    setEditDueDate(action.due_date.Valid ? action.due_date.Time : "")
    setEditPriorityID(action.priority_id || 0)
    setIsEdit(true)
  }

  function edit() {
    toast.promise(
      actionEditMut.mutateAsync({
        actionID: action.ID,
        title: editTitle,
        description: editDescription,
        due_date: editDueDate,
        priority_id: editPriorityID,
      }),
      {
        loading: "Editing...",
        success: () => {
          return `${action.ID} has been edited`
        },
        error: "Error",
      },
    )
  }

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

      <div className="mb-2">
        <Breadcrumbs>
          <Link href="/">
            <Breadcrumbs.Item nextLink>
              <BsHouse />
            </Breadcrumbs.Item>
          </Link>
          <Link href={`/project/${action.project_id}`}>
            <Breadcrumbs.Item nextLink>
              <ResolveProjectName projectID={action.project_id} />
            </Breadcrumbs.Item>
          </Link>
          <Breadcrumbs.Item>{action.title}</Breadcrumbs.Item>
        </Breadcrumbs>
      </div>

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
          <div className="mb-4 flex items-center space-x-2">
            <PriorityPickerWithEdit
              projectID={action.project_id}
              isEdit={isEdit}
              priorityID={action.priority_id}
              setEditPriorityID={setEditPriorityID}
              priority={action.priority}
            />

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
                <div className="flex w-fit items-center space-x-2 rounded-md bg-neutral-700 px-2 py-1 text-sm">
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
          <div className="bg-neutral-900 p-2 text-neutral-500">
            {isEdit ? (
              <textarea
                className="h-40 w-full bg-transparent"
                defaultValue={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            ) : (
              <RenderMarkdown markdown={action.description} />
            )}
          </div>

          <Hr className="mb-6 mt-4" />

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
                  onClick={() => edit()}
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
            <SectionAssignTags
              projectID={action.project_id}
              onAssign={(tag) =>
                linkTagMut.mutate({
                  link: true,
                  actionID: action.ID,
                  tagID: tag.ID,
                })
              }
              onUnassign={(tag) =>
                linkTagMut.mutate({
                  link: false,
                  actionID: action.ID,
                  tagID: tag.ID,
                })
              }
              tags={action.tags}
              loadingTag={
                linkTagMut.isLoading ? linkTagMut.variables?.tagID : 0
              }
            />
          </OverviewSection>
          <OverviewSection name="Linked Topics" badge={action.topics.length}>
            <ActionSectionTopics action={action} />
          </OverviewSection>
        </OverviewSide>
      </OverviewContainer>
    </div>
  )
}
