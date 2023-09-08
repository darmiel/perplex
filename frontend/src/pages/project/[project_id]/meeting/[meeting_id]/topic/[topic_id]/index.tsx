import { useRouter } from "next/router"
import { useState } from "react"
import { BsArrowDown } from "react-icons/bs"

import { navigationBorderRight } from "@/api/classes"
import MeetingList from "@/components/meeting/MeetingList"
import MeetingTopicPage from "@/components/meeting/MeetingTopicPage"
import { useLocalBoolState } from "@/hooks/localStorage"

export default function ProjectPage() {
  // collapse meeting list (true by default)
  const [showMeetingList, setShowMeetingList] = useLocalBoolState(
    "topic-overview/show-meetings",
    false,
  )

  const router = useRouter()
  const {
    project_id: projectIDStr,
    meeting_id: meetingIDStr,
    topic_id: topicIDStr,
    tab: tabFromURL,
  } = router.query

  const [tab, setTab] = useState((): string => {
    if (tabFromURL) {
      return tabFromURL as string
    }
    return "Topics"
  })

  if (
    !projectIDStr ||
    !meetingIDStr ||
    !topicIDStr ||
    Array.isArray(topicIDStr) ||
    Array.isArray(meetingIDStr) ||
    Array.isArray(topicIDStr)
  ) {
    return <div>Invalid URL</div>
  }

  const projectID = Number(projectIDStr)
  const meetingID = Number(meetingIDStr)
  const topicID = Number(topicIDStr)

  return (
    <>
      {showMeetingList ? (
        <div
          className={`${navigationBorderRight} flex h-full max-h-full w-[25rem] flex-col space-y-4 border-r border-r-neutral-800 bg-section-darker p-6`}
        >
          <MeetingList
            projectID={projectID}
            selectedMeetingID={meetingID}
            displayCollapse={true}
            onCollapse={() => setShowMeetingList(false)}
          />
        </div>
      ) : (
        <div
          className={`${navigationBorderRight} w-[4rem] flex-initial space-y-4 bg-section-darker`}
        >
          <h2 className="mt-24 -rotate-90 text-center text-neutral-400">
            <button
              onClick={() => setShowMeetingList(true)}
              className="flex items-center justify-center space-x-2 rounded-md border border-neutral-600 bg-neutral-900 px-4 py-1 "
            >
              <div>Meetings</div>
              <BsArrowDown color="gray" size="1em" />
            </button>
          </h2>
        </div>
      )}

      <MeetingTopicPage
        projectID={projectID}
        meetingID={meetingID}
        topicID={topicID}
      />
    </>
  )
}
