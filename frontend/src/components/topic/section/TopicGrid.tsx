import { Input } from "@nextui-org/react"
import { ReactNode, useState } from "react"
import { BsSearch } from "react-icons/bs"
import { BarLoader } from "react-spinners"

import { extractErrorMessage, includesFold } from "@/api/util"
import TopicCardLarge from "@/components/topic/cards/TopicCardLarge"
import BadgeHeader from "@/components/ui/BadgeHeader"
import Flex from "@/components/ui/layout/Flex"
import { useAuth } from "@/contexts/AuthContext"

export function TopicGrid({
  projectID,
  meetingID,
  slots,
  hideMeetingName = false,
}: {
  projectID: number
  meetingID: number
  slots?: ReactNode
  hideMeetingName?: boolean
}) {
  const { topics: topicsDB } = useAuth()
  const topicListQuery = topicsDB!.useList(projectID, meetingID)

  const [filter, setFilter] = useState("")

  if (topicListQuery.isLoading) {
    return <BarLoader />
  }
  if (topicListQuery.isError) {
    return (
      <>
        Error loading topics:
        {extractErrorMessage(topicListQuery.error)}
      </>
    )
  }

  const topics = topicListQuery.data.data.filter(
    (topic) =>
      !filter ||
      includesFold(topic.title, filter) ||
      includesFold(topic.description, filter),
  )

  return (
    <section className="space-y-4">
      <Flex x={4}>
        <BadgeHeader
          title="Topics"
          className="text-2xl font-semibold"
          badge={topics.length}
        />
        {slots}
      </Flex>
      <Input
        variant="bordered"
        value={filter}
        onValueChange={setFilter}
        startContent={<BsSearch />}
        placeholder={`Search in Topics...`}
        width="100%"
      />
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => (
          <TopicCardLarge
            key={topic.ID}
            hideMeetingName={hideMeetingName}
            projectID={projectID}
            topic={topic}
          />
        ))}
      </div>
    </section>
  )
}
