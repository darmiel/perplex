import { NextRouter } from "next/router"
import TopicCard from "./TopicCard"

type Topic = {
  ID: number
  title: string
  description: string
  force_solution?: boolean
}

export const dummyTopics: Topic[] = [
  {
    ID: 1,
    title: "My First Topic",
    description: "This is my First Topic! Wdyt?",
  },
  {
    ID: 2,
    title: "My Second Topic",
    description: "This is my Second Topic. What do you think?",
    force_solution: true,
  },
  {
    ID: 3,
    title: "My Third (and last) Topic 😊",
    description: "This is my Third and last Topic. What do you think?",
  },
]

export default function TopicList({
  router,
  topics,
  topicID,
  projectID,
  meetingID,
}: {
  router: NextRouter
  topicID?: string
  topics: Topic[]
  projectID: string
  meetingID: string
}) {
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
        />
      ))}
    </ul>
  )
}
