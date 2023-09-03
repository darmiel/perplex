import Head from "next/head"
import Link from "next/link"
import { useState } from "react"
import ReactDatePicker from "react-datepicker"
import { BsPen, BsTrash } from "react-icons/bs"
import { BarLoader } from "react-spinners"
import { toast } from "sonner"

import { extractErrorMessage, PickerCustomInput } from "@/api/util"
import CommentSuite from "@/components/comment/CommentSuite"
import MeetingTag from "@/components/meeting/MeetingTag"
import TopicList from "@/components/topic/TopicList"
import Button from "@/components/ui/Button"
import { RelativeDate } from "@/components/ui/DateString"
import DurationTag from "@/components/ui/DurationTag"
import SectionAssignTags from "@/components/ui/overview/common/SectionAssignTags"
import SectionAssignUsers from "@/components/ui/overview/common/SectionAssignUsers"
import OverviewContainer from "@/components/ui/overview/OverviewContainer"
import OverviewContent from "@/components/ui/overview/OverviewContent"
import OverviewSection from "@/components/ui/overview/OverviewSection"
import OverviewSide from "@/components/ui/overview/OverviewSide"
import OverviewTitle from "@/components/ui/overview/OverviewTitle"
import RenderMarkdown from "@/components/ui/text/RenderMarkdown"
import FetchUserTag from "@/components/user/FetchUserTag"
import { useAuth } from "@/contexts/AuthContext"

export default function MeetingOverview({
  projectID,
  meetingID,
}: {
  projectID: number
  meetingID: number
}) {
  const [isEdit, setIsEdit] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editStartDate, setEditStartDate] = useState("")

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [wasDeleted, setWasDeleted] = useState(false)

  const { meetings } = useAuth()

  const meetingInfoQuery = meetings!.useFind(projectID, meetingID)

  const meetingDeleteMutation = meetings!.useDelete(
    projectID,
    (_, { meetingID }) => {
      toast.success(`Meeting #${meetingID} deleted`)
      setConfirmDelete(false)
      setWasDeleted(true)
    },
  )

  const meetingUpdateMutation = meetings!.useEdit(
    projectID,
    (_, { meetingID }) => {
      toast.success(`Meeting #${meetingID} edited`)
      setIsEdit(false)
    },
  )

  const linkTagMut = meetings!.useLinkTag(projectID, meetingID, () => {})

  const linkUser = meetings!.useLinkUser(projectID, meetingID, () => {})

  if (meetingInfoQuery.isLoading) {
    return <BarLoader color="white" />
  }
  if (meetingInfoQuery.isError) {
    return (
      <div>
        Error: <pre>{extractErrorMessage(meetingInfoQuery.error)}</pre>
      </div>
    )
  }

  const meeting = meetingInfoQuery.data.data
  const date = new Date(meeting.start_date)

  // past: before now - 2 hours
  // future: after now + 2 hours
  // ongoing: in between
  function enterEdit() {
    setEditTitle(meeting.name)
    setEditDescription(meeting.description)
    setEditStartDate(meeting.start_date)

    setIsEdit(true)
  }

  function deleteMeeting() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setConfirmDelete(false)
    meetingDeleteMutation.mutate({
      meetingID: meetingID,
    })
  }

  if (wasDeleted) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col space-y-4 rounded-md border border-red-500 bg-red-500 bg-opacity-10 p-6">
          <h1 className="text-2xl font-semibold text-red-500">
            Meeting not found
          </h1>
          <p className="text-neutral-300">
            The meeting cannot be found, because you just deleted it.
            <br />
            That&apos;s what you wanted, right?{" "}
            <span className="text-neutral-500">right?</span>
          </p>
          <div className="flex items-center">
            <Link href={`/project/${projectID}`}>
              <Button raw>Go to Meeting Overview</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <Head>
        <title>Perplex - M# {meeting.name ?? "Unknown Project"}</title>
      </Head>

      <OverviewTitle
        creatorID={meeting.creator_id}
        title={meeting.name}
        titleID={meeting.ID}
        tag={<MeetingTag date={date} />}
        createdAt={new Date(meeting.CreatedAt)}
        setEditTitle={setEditTitle}
        isEdit={isEdit}
      />

      <span className="mb-3 text-neutral-500">
        {isEdit ? (
          <div className="mb-3">
            <ReactDatePicker
              selected={new Date(editStartDate)}
              onChange={(date) =>
                setEditStartDate((old) => date?.toString() || old)
              }
              showTimeSelect
              dateFormat="Pp"
              customInput={<PickerCustomInput />}
            />
          </div>
        ) : (
          <span className="flex items-center space-x-2">
            <span>
              <RelativeDate date={date} />
            </span>
            <DurationTag date={date} />
          </span>
        )}
      </span>

      <OverviewContainer>
        <OverviewContent>
          <div className="bg-neutral-900 p-2 text-neutral-500">
            {isEdit ? (
              <textarea
                className="h-40 w-full bg-transparent"
                defaultValue={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            ) : (
              <RenderMarkdown markdown={meeting.description} />
            )}
          </div>

          <hr className="mb-6 mt-4 border-gray-700" />

          <CommentSuite
            projectID={projectID}
            commentType="meeting"
            commentEntityID={meetingID}
          />

          <hr className="mb-6 mt-4 border-gray-700" />

          <TopicList projectID={projectID} meetingID={meetingID} />
        </OverviewContent>
        <OverviewSide>
          <OverviewSection name="Actions">
            {!isEdit ? (
              <div className="flex items-center space-x-2">
                <Button
                  className="w-full text-sm"
                  icon={<BsPen />}
                  onClick={() => enterEdit()}
                >
                  Edit
                </Button>
                <Button
                  className={
                    confirmDelete
                      ? "w-full bg-red-500 text-sm text-white hover:bg-red-600"
                      : "w-full text-sm text-red-500"
                  }
                  icon={<BsTrash />}
                  onClick={deleteMeeting}
                  isLoading={meetingDeleteMutation.isLoading}
                >
                  {confirmDelete ? "Confirm" : "Delete"}
                </Button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Button
                  className="w-1/2 text-sm"
                  style="primary"
                  isLoading={meetingUpdateMutation.isLoading}
                  onClick={() =>
                    meetingUpdateMutation.mutate({
                      meetingID,
                      title: editTitle,
                      description: editDescription,
                      date: new Date(editStartDate),
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
          <OverviewSection name="Creator">
            <div className="w-fit">
              <FetchUserTag userID={meeting.creator?.id || "unknown"} />
            </div>
          </OverviewSection>
          <OverviewSection name="Assigned">
            <SectionAssignUsers
              projectID={projectID}
              users={meeting.assigned_users}
              onAssign={(user) =>
                linkUser.mutate({
                  link: true,
                  userID: user.id,
                })
              }
              onUnassign={(user) =>
                linkUser.mutate({
                  link: false,
                  userID: user.id,
                })
              }
              loadingUser={
                linkUser.isLoading ? linkUser.variables?.userID : undefined
              }
            />
          </OverviewSection>
          <OverviewSection name="Tags">
            <SectionAssignTags
              projectID={projectID}
              onAssign={(tag) =>
                linkTagMut.mutate({
                  link: true,
                  tagID: tag.ID,
                })
              }
              onUnassign={(tag) =>
                linkTagMut.mutate({
                  link: false,
                  tagID: tag.ID,
                })
              }
              loadingTag={
                linkTagMut.isLoading ? linkTagMut.variables?.tagID : 0
              }
              tags={meeting.tags}
            />
          </OverviewSection>
        </OverviewSide>
      </OverviewContainer>
    </div>
  )
}
