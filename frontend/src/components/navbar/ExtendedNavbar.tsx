import { Button, Tab, Tabs, Tooltip } from "@nextui-org/react"
import { ReactNode, useState } from "react"
import { BsBoxes, BsCalendar } from "react-icons/bs"

import { MeetingListNG } from "@/components/meeting/MeetingList"
import { TopicListNG } from "@/components/topic/TopicList"
import Flex from "@/components/ui/layout/Flex"
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
  forceMeetings = false,
}: {
  projectID: number
  meetingID?: number
  topicID?: number
  forceMeetings?: boolean
}) {
  const hasMeetingID = meetingID != null

  const [showMeetingsOnTopicOverview, setShowMeetingsOnTopicOverview] =
    useLocalBoolState("topic-overview/show-meetings", false)

  return (
    <section className="flex w-full flex-col">
      <Tabs
        variant="light"
        classNames={{
          tabList: "px-3 pt-3",
        }}
        selectedKey={forceMeetings ? "meetings" : undefined}
      >
        {/* Display Topics if Meeting selected */}
        {!forceMeetings && hasMeetingID && (
          <Tab
            key="topics"
            title={
              <Flex x={1}>
                <BsBoxes />
                <span>Topics</span>
              </Flex>
            }
          >
            <TopicListNG
              projectID={projectID}
              meetingID={meetingID}
              selectedTopicID={topicID}
            />
          </Tab>
        )}

        {/* Always display meetings since we're in a project */}
        <Tab
          key="meetings"
          title={
            <Flex x={1}>
              <BsCalendar />
              <span>Meetings</span>
            </Flex>
          }
        >
          <MeetingListNG projectID={projectID} selectedMeetingID={meetingID} />
        </Tab>
      </Tabs>
    </section>
  )
}
