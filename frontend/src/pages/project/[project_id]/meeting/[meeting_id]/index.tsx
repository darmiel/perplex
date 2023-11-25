import { useRouter } from "next/router"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"

import MeetingOverview from "@/components/meeting/MeetingOverview"
import { ExtendedNavBar } from "@/components/navbar/ExtendedNavbar"

export default function ProjectPage() {
  const router = useRouter()

  const { project_id: projectIDStr, meeting_id: meetingIDStr } = router.query
  if (
    !projectIDStr ||
    !meetingIDStr ||
    Array.isArray(projectIDStr) ||
    Array.isArray(meetingIDStr)
  ) {
    return <div>Invalid URL</div>
  }

  const projectID = Number(projectIDStr)
  const meetingID = Number(meetingIDStr)

  return (
    <PanelGroup autoSaveId="extended-navbar" direction="horizontal">
      <Panel order={1} defaultSizePixels={300} collapsible={true}>
        <div className="flex h-full w-full flex-row overflow-y-auto">
          <ExtendedNavBar projectID={projectID} meetingID={meetingID} />
        </div>
      </Panel>
      <PanelResizeHandle className="w-2" />
      <Panel minSizePercentage={50} order={2}>
        <div className="h-full overflow-y-auto bg-neutral-950 p-6">
          <MeetingOverview
            key={meetingID}
            projectID={projectID}
            meetingID={meetingID}
          />
        </div>
      </Panel>
    </PanelGroup>
  )
}
