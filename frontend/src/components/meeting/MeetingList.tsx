import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"
import { BsArrowLeft, BsCalendar } from "react-icons/bs"
import { BarLoader } from "react-spinners"

import { BackendResponse, Meeting } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import MeetingTag, {
  getMeetingTense,
  MeetingTense,
  tagStyles,
} from "@/components/meeting/MeetingTag"
import CreateMeeting from "@/components/modals/MeetingCreateModal"
import Button from "@/components/ui/Button"
import CardContainer from "@/components/ui/card/CardContainer"
import Hr from "@/components/ui/Hr"
import ModalPopup from "@/components/ui/modal/ModalPopup"
import {
  TruncateSubTitle,
  TruncateTitle,
} from "@/components/ui/text/TruncateText"
import { useAuth } from "@/contexts/AuthContext"

export default function MeetingList({
  projectID,
  selectedMeetingID,
  displayCollapse = false,
  onCollapse,
  className = "",
}: {
  projectID: string
  selectedMeetingID?: string
  displayCollapse?: boolean
  onCollapse?: () => void
  className?: string
}) {
  const [showCreateMeeting, setShowCreateMeeting] = useState(false)
  const { meetingListQueryFn, meetingListQueryKey } = useAuth()

  const router = useRouter()

  const listMeetingQuery = useQuery<BackendResponse<Meeting[]>>({
    queryKey: meetingListQueryKey!(projectID),
    queryFn: meetingListQueryFn!(projectID),
  })
  if (listMeetingQuery.isLoading) {
    return <BarLoader color="white" />
  }
  if (listMeetingQuery.isError) {
    return (
      <div>
        Error: <pre>{extractErrorMessage(listMeetingQuery.error)}</pre>
      </div>
    )
  }

  const tenses: { [key: string]: Meeting[] } = {
    ongoing: [],
    future: [],
    past: [],
  }

  listMeetingQuery.data.data.forEach((meeting) => {
    tenses[getMeetingTense(new Date(meeting.start_date))].push(meeting)
  })

  const MeetingListForTense = ({ tense }: { tense: MeetingTense }) => {
    const meetings = tenses[tense]
    if (meetings.length === 0) {
      return null
    }
    const style = tagStyles[tense]
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <span className={style.color}>{style.icon}</span>
          <h2 className="font-semibold text-sm text-neutral-400">
            {style.text} Meetings
          </h2>
          <div className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-neutral-700 rounded-full">
            {meetings.length}
          </div>
        </div>
        {meetings.map((meeting, key) => (
          <div key={key}>
            <Link href={`/project/${projectID}/meeting/${meeting.ID}`}>
              <CardContainer
                style={
                  selectedMeetingID === String(meeting.ID)
                    ? "selected-border"
                    : "neutral"
                }
              >
                <div className="flex items-center space-x-2">
                  <MeetingTag icon date={new Date(meeting.start_date)} />
                  <div>
                    <TruncateTitle truncate={22}>{meeting.name}</TruncateTitle>
                  </div>
                </div>
                <TruncateSubTitle truncate={36}>
                  {meeting.start_date}
                </TruncateSubTitle>
              </CardContainer>
            </Link>
          </div>
        ))}
        <Hr className="mt-4" />
      </div>
    )
  }

  return (
    <>
      <div className={`flex flex-row space-x-2 ${className}`}>
        <Button
          onClick={() => setShowCreateMeeting(true)}
          style="neutral"
          icon={<BsCalendar color="gray" size="1em" />}
          className="w-full"
        >
          Create Meeting
        </Button>
        {displayCollapse && (
          <Button onClick={onCollapse} style="neutral">
            <BsArrowLeft color="gray" size="1em" />
          </Button>
        )}
      </div>

      <Hr className="mt-4 mb-6 border-gray-700" />

      {Object.keys(tenses).map((tense, key) => (
        <MeetingListForTense key={key} tense={tense as MeetingTense} />
      ))}

      {/* Create Meeting Popup */}
      <ModalPopup open={showCreateMeeting} setOpen={setShowCreateMeeting}>
        <CreateMeeting
          projectID={projectID}
          onClose={(newMeetingID: number) => {
            setShowCreateMeeting(false)
            router.push(`/project/${projectID}/meeting/${newMeetingID}`)
          }}
        />
      </ModalPopup>
    </>
  )
}
