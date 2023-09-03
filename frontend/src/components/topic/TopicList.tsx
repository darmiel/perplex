import { useState } from "react"

import { extractErrorMessage } from "@/api/util"
import TopicCard from "@/components/topic/TopicCard"
import Button from "@/components/ui/Button"
import { useAuth } from "@/contexts/AuthContext"

import "reactjs-popup/dist/index.css"

import { useRouter } from "next/router"
import { BsArrowLeft, BsPlusCircle } from "react-icons/bs"

import { Topic } from "@/api/types"
import CreateTopic from "@/components/modals/TopicCreateModal"
import ModalPopup from "@/components/ui/modal/ModalPopup"

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
        <TopicCard
          topic={topic}
          projectID={projectID}
          meetingID={meetingID}
          active={selectedTopicID === topic.ID}
        />
      </div>
    ))
  }
  const openTopics = showTopicListWithFilter((topic) => !topic.closed_at.Valid)

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
          <Button onClick={onCollapse} style="neutral">
            <BsArrowLeft color="gray" size="1em" />
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

      <div className="flex-grow space-y-4 overflow-y-auto overscroll-y-none">
        {/* Topic List (Open Topics) */}
        {openTopics.length > 0 && (
          <>
            {openTopics}
            <hr className="mb-6 mt-4 border-gray-700" />
          </>
        )}

        {/* Topic List (Closed Topics) */}
        {showTopicListWithFilter((topic) => topic.closed_at.Valid)}
      </div>

      {/* Create Topic Popup */}
      <ModalPopup open={showCreateTopic} setOpen={setShowCreateTopic}>
        <CreateTopic
          projectID={projectID}
          meetingID={meetingID}
          onClose={(newTopicID: number) => {
            setShowCreateTopic(false)
            router.push(
              `/project/${projectID}/meeting/${meetingID}/topic/${newTopicID}`,
            )
          }}
        />
      </ModalPopup>
    </ul>
  )
}
