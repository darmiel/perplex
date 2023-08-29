import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import Head from "next/head"
import Link from "next/link"
import { forwardRef, useState } from "react"
import ReactDatePicker from "react-datepicker"
import { BsPen, BsTrash } from "react-icons/bs"
import { BarLoader } from "react-spinners"
import { toast } from "react-toastify"

import { BackendResponse, Meeting } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import MeetingTag from "@/components/meeting/MeetingTag"
import TopicList from "@/components/topic/TopicList"
import Button from "@/components/ui/Button"
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
  projectID: string
  meetingID: string
}) {
  const [isEdit, setIsEdit] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editStartDate, setEditStartDate] = useState("")

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [wasDeleted, setWasDeleted] = useState(false)

  const {
    meetingListQueryKey,
    meetingInfoQueryFn,
    meetingInfoQueryKey,
    meetingUpdateMutFn,
    meetingUpdateMutKey,
    axios,
  } = useAuth()
  const queryClient = useQueryClient()

  const meetingInfoQuery = useQuery<BackendResponse<Meeting>>({
    queryKey: meetingInfoQueryKey!(projectID, meetingID),
    queryFn: meetingInfoQueryFn!(projectID, meetingID),
  })

  const meetingDeleteMutation = useMutation<BackendResponse<never>, AxiosError>(
    {
      mutationFn: async () =>
        (await axios!.delete(`/project/${projectID}/meeting/${meetingID}`))
          .data,
      onError: (err) => {
        toast(
          <>
            <strong>Failed to delete Meeting</strong>
            <pre>{extractErrorMessage(err)}</pre>
          </>,
          { type: "error" },
        )
      },
      onSuccess: () => {
        toast(`Meeting #${meetingID} deleted`, { type: "success" })
        queryClient.invalidateQueries(
          meetingInfoQueryKey!(projectID, meetingID),
        )
        queryClient.invalidateQueries(meetingListQueryKey!(projectID))
        setConfirmDelete(false)
        setWasDeleted(true)
      },
    },
  )

  const meetingUpdateMutation = useMutation<BackendResponse, AxiosError>({
    mutationFn: meetingUpdateMutFn!(
      projectID,
      meetingID,
      editTitle,
      editDescription,
      new Date(editStartDate),
    ),
    mutationKey: meetingUpdateMutKey!(projectID, meetingID),
    onError: (err) => {
      toast(
        <>
          <strong>Failed to update meeting</strong>
          <pre>{extractErrorMessage(err)}</pre>
        </>,
        { type: "error" },
      )
    },
    onSuccess: () => {
      toast(`Meeting #${meetingID} updated`, { type: "success" })
      queryClient.invalidateQueries(meetingInfoQueryKey!(projectID, meetingID))
      queryClient.invalidateQueries(meetingListQueryKey!(projectID))
      setIsEdit(false)
    },
  })

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
    meetingDeleteMutation.mutate()
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

  if (wasDeleted) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="flex flex-col space-y-4 p-6 border border-red-500 bg-red-500 bg-opacity-10 rounded-md">
          <h1 className="text-red-500 text-2xl font-semibold">
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

      <span className="text-neutral-500 mb-3">
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
          <>
            {date.toLocaleDateString()} - {date.toLocaleTimeString()}
          </>
        )}
      </span>

      <OverviewContainer>
        <OverviewContent>
          <div className="text-neutral-500 p-2 bg-neutral-900">
            {isEdit ? (
              <textarea
                className="w-full h-40 bg-transparent"
                defaultValue={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            ) : (
              <RenderMarkdown markdown={meeting.description} />
            )}
          </div>

          <hr className="mt-4 mb-6 border-gray-700" />

          <TopicList projectID={projectID} meetingID={meetingID} />
        </OverviewContent>
        <OverviewSide>
          <OverviewSection name="Actions">
            {!isEdit ? (
              <div className="flex space-x-2 items-center">
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
                      ? "w-full bg-red-500 hover:bg-red-600 text-white"
                      : "w-full text-red-500"
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
                  onClick={() => meetingUpdateMutation.mutate()}
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
        </OverviewSide>
      </OverviewContainer>
    </div>
  )
}
