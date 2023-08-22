import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import Comment from "../comment/Comment"
import { Topic } from "./TopicList"
import { User } from "firebase/auth"
import { useAuth } from "@/contexts/AuthContext"
import { authFetch, buildUrl } from "@/api/backend"

export type CommentType = {
  ID: number
  author_id: string
  content: string
  CreatedAt: string
  UpdatedAt: string
}

export default function TopicOverview({
  projectID,
  meetingID,
  topicID,
}: {
  projectID: string
  meetingID: string
  topicID: string
}) {
  const [commentBoxText, setCommentBoxText] = useState("")
  const [topic, setTopic] = useState<Topic>()
  const { user } = useAuth()

  async function write() {
    if (!user) {
      return
    }
    const token = await user.getIdToken()
    const resp = await authFetch(
      token,
      buildUrl([
        "project",
        projectID,
        "meeting",
        meetingID,
        "topic",
        topicID,
        "comment",
      ]),
      { method: "POST", body: commentBoxText }
    )
    if (!resp.success) {
      alert(resp.error)
    } else {
      update()
      setCommentBoxText("")
    }
  }

  async function update() {
    if (!user) {
      return
    }
    const token = await user.getIdToken()
    const resp = await authFetch(
      token,
      buildUrl(["project", projectID, "meeting", meetingID, "topic", topicID])
    )
    if (!resp.success) {
      alert(resp.error)
    } else {
      setTopic(resp.data as Topic)
    }
  }

  async function solution(commentID: number, value: boolean) {
    if (!user) {
      return
    }
    const token = await user.getIdToken()
    const resp = await authFetch(
      token,
      buildUrl([
        "project",
        projectID,
        "meeting",
        meetingID,
        "topic",
        topicID,
        "comment",
        commentID,
        "solution",
      ]),
      { method: value ? "POST" : "DELETE" }
    )
    if (!resp.success) {
      alert(resp.error)
    } else {
      update()
    }
  }

  useEffect(() => {
    update()
  }, [user, projectID, meetingID, topicID])

  if (!topic) {
    return <>Loading Topic...</>
  }

  return (
    <div className="flex flex-col">
      <span className="uppercase text-xs text-purple-500">
        {topic.force_solution ? "Discuss" : "Acknowledge"}
      </span>
      <h1 className="text-2xl font-bold">{topic.title}</h1>
      <span className="text-neutral-500 my-3">
        <ReactMarkdown
          children={topic.description}
          remarkPlugins={[remarkGfm]}
        ></ReactMarkdown>
      </span>

      <div className="relative mt-4 border-t border-gray-700">
        <textarea
          className="mt-8 w-full px-3 py-2 bg-neutral-900 border border-neutral-700"
          placeholder="Write a comment..."
          rows={4}
          onChange={(e) => setCommentBoxText(e.target.value)}
          value={commentBoxText}
        ></textarea>
        <button
          className="absolute bottom-6 right-4 bg-purple-600 text-white py-2 px-4 rounded"
          onClick={() => {
            write()
          }}
        >
          Comment
        </button>
      </div>

      <div>
        {topic.comments &&
          topic.comments.map((c, index) => (
            <Comment
              key={index}
              author={c.author_id}
              time={c.CreatedAt}
              message={c.content}
              solution={c.ID === topic.solution_id}
              onSolutionClick={() => solution(c.ID, c.ID !== topic.solution_id)}
            />
          ))}
      </div>
    </div>
  )
}
