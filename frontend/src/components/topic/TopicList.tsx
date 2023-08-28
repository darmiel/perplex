import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

import { extractErrorMessage } from "@/api/util"
import TopicCard from "@/components/topic/TopicCard"
import Button from "@/components/ui/Button"
import { useAuth } from "@/contexts/AuthContext"

import "reactjs-popup/dist/index.css"

import { useRouter } from "next/router"
import { BsArrowLeft, BsPlusCircle } from "react-icons/bs"

import { BackendResponse, Topic } from "@/api/types"
import CreateTopic from "@/components/modals/TopicCreateModal"
import ModalPopup from "@/components/ui/modal/ModalPopup"

export default function TopicList({
  selectedTopicID,
  projectID,
  meetingID,
  onCollapse,
}: {
  selectedTopicID?: string
  projectID: string
  meetingID: string
  onCollapse?: () => void
}) {
  const [showCreateTopic, setShowCreateTopic] = useState(false)

  const router = useRouter()
  const { topicListQueryFn, topicListQueryKey } = useAuth()

  const topicListQuery = useQuery<BackendResponse<Topic[]>>({
    queryKey: topicListQueryKey!(projectID, meetingID),
    queryFn: topicListQueryFn!(projectID, meetingID),
  })

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
          active={selectedTopicID === String(topic.ID)}
        />
      </div>
    ))
  }
  const openTopics = showTopicListWithFilter((topic) => !topic.closed_at.Valid)

  return (
    <ul className="flex flex-col flex-grow h-full max-h-screen overflow-y-auto space-y-4">
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
        <div className="w-full rounded-full h-2.5 bg-gray-700">
          <div
            className="bg-primary-600 h-2.5 rounded-full"
            style={{
              width: `${checkedTopicRatio * 100}%`,
            }}
          ></div>
        </div>
        <div className="text-center mt-2 text-gray-500">
          <span className="text-white">{checkedTopicCount}</span> /{" "}
          {topicListQuery.data.data.length} topics done
        </div>
      </div>

      <hr className="mt-4 mb-6 border-gray-700" />

      <div className="flex-grow overflow-y-auto space-y-4">
        {/* Topic List (Open Topics) */}
        {openTopics.length > 0 && (
          <>
            {openTopics}
            <hr className="mt-4 mb-6 border-gray-700" />
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
