import { NextRouter } from "next/router"
import TopicCard from "./TopicCard"
import { useEffect, useState } from "react"
import { authFetch, buildUrl } from "@/api/backend"
import { useAuth } from "@/contexts/AuthContext"
import { User } from "firebase/auth"
import { CommentType } from "./TopicOverview"

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
}

export default function TopicList({
  router,
  topicID,
  projectID,
  meetingID,
}: {
  router: NextRouter
  topicID?: string
  projectID: string
  meetingID: string
}) {
  const [topics, setTopics] = useState<Topic[]>([])
  const { user } = useAuth()

  async function update(user: User, projectID: string, meetingID: string) {
    const token = await user.getIdToken()
    const res = await authFetch(
      token,
      buildUrl(["project", projectID, "meeting", meetingID, "topic"])
    )
    if (res.success) {
      setTopics(res.data as Topic[])
    }
  }

  async function create() {
    if (!user) {
      alert("User not logged in")
      return
    }
    const title = prompt("Title")
    const description = prompt("Description")
    const token = await user.getIdToken()
    const res = await authFetch(
      token,
      buildUrl(["project", projectID, "meeting", meetingID, "topic"]),
      {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
        }),
      }
    )
    if (res.success) {
      update(user, projectID, meetingID)
    } else {
      alert("error: " + res.error)
    }
  }

  async function toggleTopic(toggleTopicID: number, toggleState: boolean) {
    if (!user) {
      alert("User not logged in")
      return
    }
    const token = await user.getIdToken()
    const res = await authFetch(
      token,
      buildUrl([
        "project",
        projectID,
        "meeting",
        meetingID,
        "topic",
        toggleTopicID,
        "status",
      ]),
      {
        method: toggleState ? "POST" : "DELETE",
      }
    )
    if (res.success) {
      update(user, projectID, meetingID)
    } else {
      alert("error: " + res.error)
    }
  }

  useEffect(() => {
    if (!user) {
      return
    }
    update(user, projectID, meetingID)
  }, [user, projectID, meetingID])

  return (
    <ul className="space-y-4">
      {topics.map((topic, key) => (
        <TopicCard
          key={key}
          title={topic.title}
          description={topic.description}
          active={topicID !== undefined && topicID === String(topic.ID)}
          onClick={() =>
            router.push(
              `/project/${projectID}/meeting/${meetingID}/topic/${topic.ID}`
            )
          }
          onToggle={(toggled) => {
            toggleTopic(topic.ID, toggled)
          }}
          checked={topic.closed_at.Valid}
        />
      ))}
      <div
        className="border border-neutral-500 px-4 py-2 text-center"
        onClick={() => create()}
      >
        Create Topic
      </div>
    </ul>
  )
}
