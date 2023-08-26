import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"
import { BsArrowLeft, BsPlusCircle } from "react-icons/bs"
import { BarLoader } from "react-spinners"

import { BackendResponse, Meeting } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import MeetingTag from "@/components/meeting/MeetingTag"
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
}: {
  projectID: string
  selectedMeetingID?: string
  displayCollapse?: boolean
  onCollapse?: () => void
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

  return (
    <>
      <div className="flex flex-row space-x-2">
        <Button
          onClick={() => setShowCreateMeeting(true)}
          style="neutral"
          icon={<BsPlusCircle color="gray" size="1em" />}
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

      <div className="space-y-4">
        {listMeetingQuery.data.data.map((meeting, key) => (
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
