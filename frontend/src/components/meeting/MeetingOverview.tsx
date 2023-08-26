import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { forwardRef, useState } from "react"
import ReactDatePicker from "react-datepicker"
import { BsForward, BsPen, BsPlay, BsRewind } from "react-icons/bs"
import { BarLoader } from "react-spinners"
import { toast } from "react-toastify"

import { BackendResponse, Meeting } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import RenderMarkdown from "@/components/ui/text/RenderMarkdown"
import { useAuth } from "@/contexts/AuthContext"

import TopicList from "../topic/TopicList"
import Button from "../ui/Button"
import OverviewContainer from "../ui/overview/OverviewContainer"
import OverviewContent from "../ui/overview/OverviewContent"
import OverviewSection from "../ui/overview/OverviewSection"
import OverviewSide from "../ui/overview/OverviewSide"
import OverviewTitle from "../ui/overview/OverviewTitle"
import Tag from "../ui/Tag"
import FetchUserTag from "../user/FetchUserTag"

const tags = {
  past: {
    icon: <BsRewind />,
    text: "Past",
    className: "bg-neutral-700 text-white",
  },
  future: {
    icon: <BsForward />,
    text: "Future",
    className: "bg-blue-600 text-white",
  },
  ongoing: {
    icon: <BsPlay />,
    text: "Ongoing",
    className: "bg-green-600 text-white",
  },
}

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

  const {
    meetingListQueryKey,
    meetingInfoQueryFn,
    meetingInfoQueryKey,
    meetingUpdateMutFn,
    meetingUpdateMutKey,
  } = useAuth()
  const queryClient = useQueryClient()

  const meetingInfoQuery = useQuery<BackendResponse<Meeting>>({
    queryKey: meetingInfoQueryKey!(projectID, meetingID),
    queryFn: meetingInfoQueryFn!(projectID, meetingID),
  })

  const meetingUpdateMutation = useMutation<BackendResponse<never>, AxiosError>(
    {
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
        queryClient.invalidateQueries(
          meetingInfoQueryKey!(projectID, meetingID),
        )
        queryClient.invalidateQueries(meetingListQueryKey!(projectID))
        setIsEdit(false)
      },
    },
  )

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
  let tag
  const now = new Date()
  if (date.getTime() < now.getTime() - 2 * 3600 * 1000) {
    tag = tags.past
  } else if (date.getTime() > now.getTime() + 2 * 3600 * 1000) {
    tag = tags.future
  } else {
    tag = tags.ongoing
  }

  function enterEdit() {
    setEditTitle(meeting.name)
    setEditDescription(meeting.description)
    setEditStartDate(meeting.start_date)

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

  return (
    <div className="flex flex-col">
      <OverviewTitle
        creatorID={meeting.creator_id}
        title={meeting.name}
        titleID={meeting.ID}
        tag={
          <Tag className={tag.className}>
            <div>{tag.icon}</div>
            <div>{tag.text}</div>
          </Tag>
        }
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
              <Button
                className="w-full text-sm"
                icon={<BsPen />}
                onClick={() => enterEdit()}
              >
                Edit Meeting
              </Button>
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