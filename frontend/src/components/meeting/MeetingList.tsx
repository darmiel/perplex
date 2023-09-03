import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"
import { BsArrowDown, BsArrowLeft, BsArrowUp, BsCalendar } from "react-icons/bs"
import { BarLoader } from "react-spinners"

import { Meeting } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import MeetingTag, {
  getMeetingTense,
  MeetingTense,
  tagStyles,
} from "@/components/meeting/MeetingTag"
import CreateMeeting from "@/components/modals/MeetingCreateModal"
import Button from "@/components/ui/Button"
import CardContainer from "@/components/ui/card/CardContainer"
import ModalPopup from "@/components/ui/modal/ModalPopup"
import {
  TruncateSubTitle,
  TruncateTitle,
} from "@/components/ui/text/TruncateText"
import { useAuth } from "@/contexts/AuthContext"
import { useLocalBoolState } from "@/hooks/localStorage"

export default function MeetingList({
  projectID,
  selectedMeetingID,
  displayCollapse = false,
  onCollapse,
  className = "",
}: {
  projectID: number
  selectedMeetingID?: number
  displayCollapse?: boolean
  onCollapse?: () => void
  className?: string
}) {
  const [showCreateMeeting, setShowCreateMeeting] = useState(false)
  const { meetings } = useAuth()

  const router = useRouter()

  const listMeetingQuery = meetings!.useList(projectID)
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
    // collapse meetings for tense
    const [expandTense, setExpandTense] = useLocalBoolState(
      `meeting-overview/expand-tense/${tense}`,
      true,
    )

    const meetings = tenses[tense]
    if (meetings.length === 0) {
      return null
    }
    const style = tagStyles[tense]
    return (
      <div className="space-y-4">
        <button
          className="flex w-full items-center justify-between rounded-md px-2 py-1 hover:bg-neutral-700"
          onClick={() => setExpandTense((prev) => !prev)}
        >
          <div className="flex flex-row items-center space-x-2">
            <span className={style.color}>{style.icon}</span>
            <h2 className="text-sm font-semibold text-neutral-400">
              {style.text} Meetings
            </h2>
            <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-700 text-xs font-bold text-white">
              {meetings.length}
            </div>
          </div>
          {expandTense ? <BsArrowDown /> : <BsArrowUp />}
        </button>
        {expandTense &&
          meetings.map((meeting, key) => (
            <div key={key}>
              <Link href={`/project/${projectID}/meeting/${meeting.ID}`}>
                <CardContainer
                  style={
                    selectedMeetingID === meeting.ID
                      ? "selected-border"
                      : "neutral"
                  }
                >
                  <div className="flex items-center space-x-2">
                    <MeetingTag icon date={new Date(meeting.start_date)} />
                    <div>
                      <TruncateTitle truncate={22}>
                        {meeting.name}
                      </TruncateTitle>
                    </div>
                  </div>
                  <TruncateSubTitle truncate={36}>
                    {meeting.start_date}
                  </TruncateSubTitle>
                </CardContainer>
              </Link>
            </div>
          ))}
        <div className="mt-4"></div>
      </div>
    )
  }

  return (
    <>
      <div className={`flex h-fit flex-row space-x-2 ${className}`}>
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

      <div className="h-full max-h-full overflow-y-auto overscroll-none">
        {Object.keys(tenses).map((tense, key) => (
          <MeetingListForTense key={key} tense={tense as MeetingTense} />
        ))}
      </div>

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
