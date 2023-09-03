import { Tabs } from "@geist-ui/core"
import { useRouter } from "next/router"
import { useState } from "react"
import { BsArchive, BsArrowDown } from "react-icons/bs"

import { navigationBorderRight } from "@/api/classes"
import MeetingList from "@/components/meeting/MeetingList"
import MeetingNotePage from "@/components/meeting/MeetingNotePage"
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
          className={`${navigationBorderRight} flex flex-col h-full max-h-full w-[25rem] bg-section-darker p-6 space-y-4 border-r border-r-neutral-800`}
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
          className={`${navigationBorderRight} flex-initial w-[4rem] bg-section-darker space-y-4`}
        >
          <h2 className="text-center mt-24 text-neutral-400 -rotate-90">
            <button
              onClick={() => setShowMeetingList(true)}
              className="bg-neutral-900 border border-neutral-600 rounded-md px-4 py-1 flex justify-center items-center space-x-2 "
            >
              <div>Meetings</div>
              <BsArrowDown color="gray" size="1em" />
            </button>
          </h2>
        </div>
      )}

      <Tabs
        className="[&>*:nth-child(2)]:h-full [&>*:nth-child(2)]:!pt-0"
        value={tab}
        onChange={(newTab) => {
          setTab(newTab)
          // update URL
          router.push(
            {
              query: {
                ...router.query,
                tab: newTab,
              },
            },
            undefined,
            { shallow: true },
          )
        }}
        width="100%"
        height="100%"
        align="center"
        hideBorder
      >
        <Tabs.Item
          label={
            <>
              <BsArchive />
              Topics
            </>
          }
          value="Topics"
        >
          <MeetingTopicPage
            projectID={projectID}
            meetingID={meetingID}
            topicID={topicID}
          />
        </Tabs.Item>
        <Tabs.Item label="Notes" value="Notes">
          <MeetingNotePage />
        </Tabs.Item>
      </Tabs>
    </>
  )
}
