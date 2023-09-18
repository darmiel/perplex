import { useState } from "react"

import { extractErrorMessage } from "@/api/util"
import Button from "@/components/ui/Button"
import { useAuth } from "@/contexts/AuthContext"

import "reactjs-popup/dist/index.css"

import {
  Accordion,
  AccordionItem,
  Checkbox,
  Chip,
  ScrollShadow,
} from "@nextui-org/react"
import clsx from "clsx"
import Link from "next/link"
import { useRouter } from "next/router"
import { BsPlusCircle } from "react-icons/bs"

import { Topic } from "@/api/types"
import CreateTopicModal from "@/components/modals/TopicCreateModal"
import BadgeHeader from "@/components/ui/BadgeHeader"
import Flex from "@/components/ui/layout/Flex"
import ModalPopup from "@/components/ui/modal/ModalPopup"

function TopicListItem({
  topic,
  projectID,
  selected = false,
}: {
  topic: Topic
  projectID: number
  selected?: boolean
}) {
  const { user, topics } = useAuth()
  const toggleTopicMutation = topics!.useStatus(
    projectID,
    topic.meeting_id,
    () => {},
  )

  const isAssignedToUser = topic.assigned_users.some((u) => u.id === user?.uid)
  return (
    <Flex
      col
      className={clsx(
        "rounded-md border border-transparent p-2 transition duration-150 ease-in-out",
        "hover:border-neutral-800 hover:bg-neutral-900",
        {
          "bg-neutral-800": selected,
        },
      )}
    >
      <Flex>
        <Checkbox
          isIndeterminate={toggleTopicMutation.isLoading}
          isSelected={topic.closed_at.Valid}
          onValueChange={(checked) => {
            toggleTopicMutation.mutate({
              topicID: topic.ID,
              close: checked,
            })
          }}
        />
        <h2
          className={clsx("truncate text-neutral-200", {
            "mr-1": isAssignedToUser,
          })}
        >
          {topic.title}
          <span className="text-sm text-neutral-500"> #{topic.ID}</span>
        </h2>
        {isAssignedToUser && (
          <span className="ml-auto h-3 w-3 animate-pulse rounded-full bg-primary-600"></span>
        )}
      </Flex>
      {topic.tags?.length > 0 && (
        <ScrollShadow orientation="horizontal" hideScrollBar className="mt-1">
          <Flex gap={1}>
            {topic.tags.map((tag) => (
              <Chip
                key={tag.ID}
                className="whitespace-nowrap"
                variant="bordered"
                style={{
                  borderColor: tag.color,
                }}
              >
                {tag.title}
              </Chip>
            ))}
          </Flex>
        </ScrollShadow>
      )}
    </Flex>
  )
}

export default function TopicList({
  projectID,
  meetingID,
  selectedTopicID,
  onCollapse,
}: {
  projectID: number
  meetingID: number
  selectedTopicID?: number
  onCollapse?: () => void
}) {
  const [showCreateTopic, setShowCreateTopic] = useState(false)

  const router = useRouter()
  const { topics } = useAuth()

  const topicListQuery = topics!.useList(projectID, meetingID)

  if (topicListQuery.isLoading) {
    return <div>Loading...</div>
  }
  if (topicListQuery.isError) {
    return (
      <div>
        Error: <pre>{extractErrorMessage(topicListQuery.error)}</pre>
      </div>
    )
  }

  const checkedTopicCount = topicListQuery.data.data.filter(
    (topic) => topic.closed_at.Valid,
  ).length

  const checkedTopicRatio = checkedTopicCount / topicListQuery.data.data.length

  const showTopicListWithFilter = (filter: (topic: Topic) => boolean) => {
    return topicListQuery.data.data.filter(filter).map((topic) => (
      <div key={topic.ID}>
        <Link
          href={`/project/${projectID}/meeting/${topic.meeting_id}/topic/${topic.ID}`}
        >
          <TopicListItem
            projectID={projectID}
            topic={topic}
            selected={selectedTopicID === topic.ID}
          />
        </Link>
      </div>
    ))
  }
  const openTopics = showTopicListWithFilter((topic) => !topic.closed_at.Valid)
  const closedTopics = showTopicListWithFilter((topic) => topic.closed_at.Valid)

  return (
    <ul className="flex h-full flex-grow flex-col space-y-4  overflow-y-auto">
      <div className="flex space-x-2">
        <Button
          onClick={() => setShowCreateTopic(true)}
          style="neutral"
          icon={<BsPlusCircle color="gray" size="1em" />}
          className="w-full"
        >
          Create Topic
        </Button>
        {onCollapse && (
          <Button onClick={onCollapse} style="animated">
            <Button.ArrowLeft />
          </Button>
        )}
      </div>

      {/* ProgressBar */}
      <div>
        <div className="h-2.5 w-full rounded-full bg-gray-700">
          <div
            className="h-2.5 rounded-full bg-primary-600"
            style={{
              width: `${checkedTopicRatio * 100}%`,
            }}
          ></div>
        </div>
        <div className="mt-2 text-center text-gray-500">
          <span className="text-white">{checkedTopicCount}</span> /{" "}
          {topicListQuery.data.data.length} topics done
        </div>
      </div>

      <hr className="mb-6 mt-4 border-gray-700" />

      <ScrollShadow hideScrollBar className="h-full">
        <Accordion selectionMode="multiple" defaultSelectedKeys="all">
          <AccordionItem
            key="open-topics"
            title={
              <BadgeHeader title="Open Topics" badge={openTopics.length} />
            }
          >
            <div className="gap-4 space-y-0">{openTopics}</div>
          </AccordionItem>
          <AccordionItem
            key="closed-topics"
            title={
              <BadgeHeader title="Closed Topics" badge={closedTopics.length} />
            }
          >
            <div className="gap-4 space-y-2">{closedTopics}</div>
          </AccordionItem>
        </Accordion>
      </ScrollShadow>

      {/* Create Topic Popup */}
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
    </ul>
  )
}
