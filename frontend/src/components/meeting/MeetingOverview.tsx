import {
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Progress,
  Tab,
  Tabs,
  Tooltip,
} from "@nextui-org/react"
import Head from "next/head"
import Link from "next/link"
import { useEffect, useState } from "react"
import ReactDatePicker from "react-datepicker"
import {
  BsBack,
  BsCheck,
  BsHouse,
  BsInfoCircle,
  BsPen,
  BsPlusCircleFill,
  BsTrash,
  BsTrashFill,
  BsTriangleFill,
  BsX,
} from "react-icons/bs"
import { BarLoader } from "react-spinners"
import { toast } from "sonner"

import { extractErrorMessage, PickerCustomInput } from "@/api/util"
import CommentSuite from "@/components/comment/CommentSuite"
import MeetingSelectBreadcrumbs from "@/components/meeting/breadcrumbs/MeetingSelectBreadcrumbs"
import MeetingTag, { getMeetingTense } from "@/components/meeting/MeetingTag"
import CreateTopicModal from "@/components/modals/TopicCreateModal"
import ProjectSelectBreadcrumbs from "@/components/project/breadcrumbs/ProjectSelectBreadcrumbs"
import { TopicListView } from "@/components/topic/section/TopicListView"
import Admonition from "@/components/ui/Admonition"
import { RelativeDate } from "@/components/ui/DateString"
import DurationTag from "@/components/ui/DurationTag"
import Flex from "@/components/ui/layout/Flex"
import ModalPopup from "@/components/ui/modal/ModalPopup"
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
import { useLocalStrState } from "@/hooks/localStorage"

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
  const [editEndDate, setEditEndDate] = useState("")

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [wasDeleted, setWasDeleted] = useState(false)

  const [tab, setTab] = useLocalStrState("meeting-tab/selected-tab", "topics")
  const [showCreateTopic, setShowCreateTopic] = useState(false)

  const { meetings, topics } = useAuth()

  const meetingInfoQuery = meetings!.useFind(projectID, meetingID)
  const topicListQuery = topics!.useList(projectID, meetingID)

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

  const markReadyMut = meetings!.useSetReady(projectID, meetingID, () => {})

  const [progress, setProgress] = useState(0)

  let startDate: Date | undefined

  useEffect(() => {
    if (meetingInfoQuery.data?.data) {
      const interval = setInterval(() => {
        if (startDate) {
          const now = new Date().getTime()
          setProgress(
            (now - startDate.getTime()) /
              (endDate.getTime() - startDate.getTime()),
          )
        }
      }, 1000)
      return () => clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingInfoQuery])

  if (meetingInfoQuery.isLoading) {
    return <BarLoader color="white" />
  }
  if (meetingInfoQuery.isError || wasDeleted) {
    const error = extractErrorMessage(meetingInfoQuery.error)
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col space-y-4 rounded-md border border-red-500 bg-red-500 bg-opacity-10 p-6">
          <h1 className="text-2xl font-semibold text-red-500">Error</h1>
          <p className="text-neutral-300">
            {error !== "null" ? error : "Meeting not found"}
          </p>
          <div className="flex items-center">
            <Button
              variant="light"
              color="danger"
              startContent={<BsBack />}
              as={Link}
              href={`/project/${projectID}`}
            >
              Back to Project Overview
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const meeting = meetingInfoQuery.data.data
  startDate = new Date(meeting.start_date)
  const endDate = new Date(meeting.end_date)

  function enterEdit() {
    setEditTitle(meeting.name)
    setEditDescription(meeting.description)

    // temporary fix for migration
    const startDate = new Date(meeting.start_date)
    const endDate = meeting.end_date ? new Date(meeting.end_date) : new Date()
    if (endDate.getTime() < startDate.getTime()) {
      endDate.setTime(startDate.getTime() + 30 * 60000)
    }
    setEditStartDate(meeting.start_date)
    setEditEndDate(endDate.toString())

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

  return (
    <div className="flex flex-col">
      <Head>
        <title>Perplex - M# {meeting.name ?? "Unknown Project"}</title>
      </Head>

      <div className="mb-2">
        <Breadcrumbs>
          <BreadcrumbItem href="/" startContent={<BsHouse />}>
            Home
          </BreadcrumbItem>
          <BreadcrumbItem href={`/project/${projectID}`}>
            <ProjectSelectBreadcrumbs projectID={projectID} />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <MeetingSelectBreadcrumbs
              meetingID={meeting.ID}
              meetingName={meeting.name}
              projectID={projectID}
            />
          </BreadcrumbItem>
        </Breadcrumbs>
      </div>

      <OverviewTitle
        creatorID={meeting.creator_id}
        title={meeting.name}
        tag={<MeetingTag start={startDate} end={endDate} />}
        createdAt={new Date(meeting.CreatedAt)}
        setEditTitle={setEditTitle}
        isEdit={isEdit}
      />

      {!meeting.is_ready && (
        <Admonition style="danger" className="mb-4">
          <BsTriangleFill />
          <span>This meeting has not been marked as ready</span>
          <Tooltip content="This visual cue serves as a reminder to schedule your meetings in advance to avoid last-minute hassles.">
            <span>
              <BsInfoCircle />
            </span>
          </Tooltip>
        </Admonition>
      )}

      <span className="mb-3 text-neutral-500">
        {isEdit ? (
          <div className="mb-3">
            <ReactDatePicker
              className="w-full"
              selected={new Date(editStartDate)}
              onChange={(date) =>
                setEditStartDate((old) => date?.toString() || old)
              }
              showTimeInput
              customInput={<PickerCustomInput />}
            />
            <ReactDatePicker
              selected={new Date(editEndDate)}
              onChange={(date) =>
                setEditEndDate((old) => date?.toString() || old)
              }
              minDate={new Date(editStartDate)}
              showTimeInput
              customInput={<PickerCustomInput />}
            />
          </div>
        ) : (
          <span className="flex items-center space-x-2 whitespace-nowrap">
            <span>from</span>
            <span className="text-white">
              <RelativeDate date={startDate} />
            </span>
            {startDate.getTime() < endDate.getTime() && (
              <>
                <DurationTag date={startDate} />
                <span>to</span>
                <span className="text-white">
                  <RelativeDate date={endDate} />
                </span>
              </>
            )}
            {getMeetingTense(startDate, endDate) === "ongoing" && (
              <Progress minValue={0} maxValue={1} value={progress} />
            )}
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
              <RenderMarkdown
                markdown={meeting.description || "*No Description*"}
              />
            )}
          </div>

          <hr className="mb-6 mt-4 border-gray-700" />

          <Tabs
            variant="light"
            selectedKey={tab}
            onSelectionChange={(key) => setTab(key.toString())}
          >
            <Tab key="conversation" title="Conversation">
              <CommentSuite
                projectID={projectID}
                commentType="meeting"
                commentEntityID={meetingID}
              />
            </Tab>
            <Tab key="topics" title="Topics">
              {topicListQuery.isLoading ? (
                <span>Loading Topics...</span>
              ) : topicListQuery.isError ? (
                <span>Error: {extractErrorMessage(topicListQuery.error)}</span>
              ) : (
                <TopicListView meetingID={meetingID} projectID={projectID} />
              )}
            </Tab>
          </Tabs>
        </OverviewContent>
        <OverviewSide>
          <OverviewSection name="Actions">
            {!isEdit ? (
              <div className="flex flex-col space-y-2">
                <Flex x={2}>
                  <Button
                    onClick={() => setShowCreateTopic(true)}
                    startContent={<BsPlusCircleFill />}
                    className="w-full"
                    color="primary"
                  >
                    New Topic
                  </Button>
                  <Tooltip
                    content={meeting.is_ready ? "Mark Unready" : "Mark Ready"}
                  >
                    <Button
                      isIconOnly
                      startContent={meeting.is_ready ? <BsX /> : <BsCheck />}
                      onClick={() =>
                        markReadyMut.mutate({ ready: !meeting.is_ready })
                      }
                      isLoading={markReadyMut.isLoading}
                      color={meeting.is_ready ? "warning" : "success"}
                    />
                  </Tooltip>
                  <Tooltip content="Edit Meeting">
                    <Button
                      isIconOnly
                      startContent={<BsPen />}
                      onClick={() => enterEdit()}
                    />
                  </Tooltip>
                  <Tooltip content="Delete Topic" color="danger">
                    <Button
                      isIconOnly
                      startContent={
                        confirmDelete ? <BsTrashFill /> : <BsTrash />
                      }
                      variant={confirmDelete ? "solid" : "bordered"}
                      color="danger"
                      onClick={deleteMeeting}
                      isLoading={meetingDeleteMutation.isLoading}
                    />
                  </Tooltip>
                </Flex>
                {/* Create Topic Popup */}
                <ModalPopup open={showCreateTopic} setOpen={setShowCreateTopic}>
                  <CreateTopicModal
                    projectID={projectID}
                    meetingID={meetingID}
                    onClose={() => setShowCreateTopic(false)}
                  />
                </ModalPopup>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Button
                  className="w-1/2 text-sm"
                  isLoading={meetingUpdateMutation.isLoading}
                  onClick={() =>
                    meetingUpdateMutation.mutate({
                      meetingID,
                      title: editTitle,
                      description: editDescription,
                      start_date: new Date(editStartDate),
                      end_date: new Date(editEndDate),
                    })
                  }
                >
                  Save
                </Button>
                <Button
                  className="w-1/2 text-sm"
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
              users={meeting.assigned_users ?? []}
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
