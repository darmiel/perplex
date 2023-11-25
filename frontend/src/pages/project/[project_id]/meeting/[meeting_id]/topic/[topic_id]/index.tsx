import { useRouter } from "next/router"
import { useState } from "react"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"

import { ExtendedNavBar } from "@/components/navbar/ExtendedNavbar"
import TopicOverview from "@/components/topic/TopicOverview"
import { useLocalBoolState } from "@/hooks/localStorage"

export default function ProjectPage() {
  const [showTopicList, setShowTopicList] = useLocalBoolState(
    "topic-overview/show-topics",
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
    <PanelGroup autoSaveId="topic-view" direction="horizontal">
      <Panel
        order={1}
        defaultSizePixels={300}
        collapsible={true}
        collapsedSizePixels={10}
        onCollapse={() => alert("col")}
      >
        <div className="flex h-full w-full flex-row overflow-y-auto">
          {/* <TopicList projectID={projectID} meetingID={meetingID} /> */}
          <ExtendedNavBar projectID={projectID} meetingID={meetingID} />
        </div>
      </Panel>
      <PanelResizeHandle className="w-2" />
      <Panel minSizePercentage={50} order={2}>
        <div className="h-full overflow-y-auto bg-neutral-950 p-6">
          <TopicOverview
            key={topicID}
            projectID={projectID}
            meetingID={meetingID}
            topicID={topicID}
          />
        </div>
      </Panel>
    </PanelGroup>
  )
}
