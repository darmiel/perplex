import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import Popup from "reactjs-popup"

import { extractErrorMessage } from "@/api/util"
import Button from "@/components/controls/Button"
import TopicCard from "@/components/topic/TopicCard"
import { CommentType } from "@/components/topic/TopicOverview"
import { useAuth } from "@/contexts/AuthContext"

import "reactjs-popup/dist/index.css"

import CreateTopic from "./CreateTopic"

export type User = {
  id: string
  name: string
}

export type Topic = {
  ID: number
  title: string
  description: string
  force_solution?: boolean
  comments: CommentType[]
  solution_id?: number
  closed_at: {
    Valid: boolean
  }
  assigned_users: User[]
}

export default function TopicList({
  selectedTopicID,
  projectID,
  meetingID,
  setSelectedTopicID,
}: {
  selectedTopicID?: string
  projectID: string
  meetingID: string
  setSelectedTopicID?: (topicID: string) => void
}) {
  const [showCreateTopic, setShowCreateTopic] = useState(false)

  const { axios } = useAuth()

  const topicListQuery = useQuery<{ data: Topic[] }>({
    queryKey: [{ projectID }, { meetingID }, "topics"],
    queryFn: async () =>
      (await axios!.get(`/project/${projectID}/meeting/${meetingID}/topic`))
        .data,
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
      {/* ProgressBar */}
      <div>
        <div className="w-full rounded-full h-2.5 bg-gray-700">
          <div
            className="bg-purple-600 h-2.5 rounded-full w-[45%]"
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

      <Button onClick={() => setShowCreateTopic(true)}>Create Topic</Button>

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
            setSelectedTopicID?.(String(newTopicID))
          }}
        />
      </Popup>
    </ul>
  )
}
