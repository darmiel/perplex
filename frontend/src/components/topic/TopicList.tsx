import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import Popup from "reactjs-popup"

import { extractErrorMessage } from "@/api/util"
import TopicCard from "@/components/topic/TopicCard"
import Button from "@/components/ui/Button"
import { useAuth } from "@/contexts/AuthContext"

import "reactjs-popup/dist/index.css"

import { useRouter } from "next/router"
import { BsPlusCircle } from "react-icons/bs"

import { BackendResponse, Topic } from "@/api/types"

import CreateTopic from "./CreateTopic"

export default function TopicList({
  selectedTopicID,
  projectID,
  meetingID,
}: {
  selectedTopicID?: string
  projectID: string
  meetingID: string
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
    <ul className="space-y-4">
      <Button
        onClick={() => setShowCreateTopic(true)}
        style="neutral"
        icon={<BsPlusCircle color="gray" size="1em" />}
        className="w-full"
      >
        Create Topic
      </Button>

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

      {/* Topic List (Open Topics) */}
      {openTopics.length > 0 && (
        <>
          {openTopics}
          <hr className="mt-4 mb-6 border-gray-700" />
        </>
      )}

      {/* Topic List (Closed Topics) */}
      {showTopicListWithFilter((topic) => topic.closed_at.Valid)}

      {/* Create Topic Popup */}
      <Popup
        modal
        contentStyle={{
          background: "none",
          border: "none",
          width: "auto",
        }}
        overlayStyle={{
          backgroundColor: "rgba(0, 0, 0, 0.7)",
        }}
        open={showCreateTopic}
        onClose={() => setShowCreateTopic(false)}
      >
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
      </Popup>
    </ul>
  )
}
