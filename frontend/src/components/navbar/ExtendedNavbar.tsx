import { Button, Tooltip } from "@nextui-org/react"
import { useRouter } from "next/router"
import { ReactNode, useState } from "react"
import { BsBoxes, BsCalendar, BsPlusCircle, BsSignpost } from "react-icons/bs"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"

import { MeetingListNG } from "@/components/meeting/MeetingList"
import MeetingFollowUp from "@/components/meeting/modals/MeetingFollowUp"
import CreateTopicModal from "@/components/modals/TopicCreateModal"
import { TopicListNG } from "@/components/topic/TopicList"
import ModalPopup from "@/components/ui/modal/ModalPopup"
import { useLocalBoolState } from "@/hooks/localStorage"

export function useToggleButton(
  tooltip: string,
  startContent: ReactNode,
  defaultState: boolean = false,
  onUpdate?: (isToggled: boolean) => void,
) {
  const [isToggled, setIsToggled] = useState(defaultState)
  return {
    isToggled,
    setIsToggled,
    component: (
      <Tooltip content={tooltip} delay={500} closeDelay={0}>
        <Button
          isIconOnly
          startContent={startContent}
          variant={isToggled ? "solid" : "bordered"}
          size="sm"
          onClick={() =>
            setIsToggled((prev) => {
              onUpdate?.(!prev)
              return !prev
            })
          }
        />
      </Tooltip>
    ),
  }
}

export function ExtendedNavBar({
  projectID,
  meetingID,
  topicID,
}: {
  projectID: number
  meetingID?: number
  topicID?: number
}) {
  const hasMeetingID = meetingID !== undefined

  const [showCreateTopic, setShowCreateTopic] = useState(false)
  const [showFollowUp, setShowFollowUp] = useState(false)

  const [showMeetingsOnTopicOverview, setShowMeetingsOnTopicOverview] =
    useLocalBoolState("topic-overview/show-meetings", false)

  const router = useRouter()

  const { component: topicsButton, isToggled: topicsToggled } = useToggleButton(
    "Show Topics",
    <BsBoxes />,
    true,
  )

  const { component: meetingsButton, isToggled: meetingsToggled } =
    useToggleButton(
      "Show Meetings",
      <BsCalendar />,
      !hasMeetingID || showMeetingsOnTopicOverview,
      (toggled) => {
        if (hasMeetingID) {
          setShowMeetingsOnTopicOverview(toggled)
        }
      },
    )

  return (
    <section className="flex w-full flex-col">
      {/* Display Panel Toggle Buttons */}
      <nav className="flex items-center justify-between p-3">
        <div className="flex items-center space-x-2">
          {/* Display Show Topics if Meeting selected */}
          {meetingID !== undefined && topicsButton}
          {meetingsButton}
        </div>
        <div className="flex items-center space-x-2">
          <Tooltip content="Follow Up" delay={500} closeDelay={0}>
            <Button
              isIconOnly
              startContent={<BsSignpost />}
              variant="light"
              size="sm"
              onClick={() => setShowFollowUp(true)}
            />
          </Tooltip>
          {/* Show Create Topic Button if Meeting selected */}
          {meetingID !== undefined && (
            <Tooltip content="Create Topic" delay={500} closeDelay={0}>
              <Button
                variant="light"
                startContent={<BsPlusCircle />}
                color="success"
                size="sm"
                onClick={() => setShowCreateTopic(true)}
              >
                New Topic
              </Button>
            </Tooltip>
          )}
        </div>
      </nav>

      {/* Panels */}
      <PanelGroup autoSaveId="extended-navbar" direction="vertical">
        {topicsToggled && meetingID !== undefined && (
          <>
            <Panel order={1} className="border-t border-t-neutral-700">
              <TopicListNG
                projectID={projectID}
                meetingID={meetingID}
                selectedTopicID={topicID}
              />
            </Panel>
            <PanelResizeHandle className="h-2" />
          </>
        )}
        {meetingsToggled && (
          <>
            <Panel order={2} className="border-t border-t-neutral-700 p-2">
              <MeetingListNG
                projectID={projectID}
                selectedMeetingID={meetingID}
              />
            </Panel>
          </>
        )}
      </PanelGroup>

      {/* Modals */}
      {meetingID !== undefined && (
        <ModalPopup open={showCreateTopic} setOpen={setShowCreateTopic}>
          <CreateTopicModal
            projectID={projectID}
            meetingID={meetingID}
            onClose={(newTopicID?: number) => {
              setShowCreateTopic(false)
              newTopicID &&
                router.push(
                  `/project/${projectID}/meeting/${meetingID}/topic/${newTopicID}`,
                )
            }}
          />
        </ModalPopup>
      )}
      <ModalPopup open={showFollowUp} setOpen={setShowFollowUp}>
        <MeetingFollowUp
          projectID={projectID}
          onClose={() => setShowFollowUp(false)}
        />
      </ModalPopup>
    </section>
  )
}
