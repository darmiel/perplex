import { Button, ButtonGroup } from "@nextui-org/react"
import { BsGrid, BsTable } from "react-icons/bs"
import { BarLoader } from "react-spinners"

import { Topic } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import { TopicGrid } from "@/components/topic/section/TopicGrid"
import { TopicTable } from "@/components/topic/section/TopicTable"
import BadgeHeader from "@/components/ui/BadgeHeader"
import Flex from "@/components/ui/layout/Flex"
import useSearch from "@/components/ui/SearchBar"
import { useAuth } from "@/contexts/AuthContext"
import { useLocalState } from "@/hooks/localStorage"

type TopicView = "table" | "grid"

export function TopicListView({
  projectID,
  meetingID,
}: {
  projectID: number
  meetingID: number
}) {
  const [topicViewMode, setTopicViewMode] = useLocalState<TopicView>(
    "topic-list/view-mode",
    "grid",
    (value) => value as TopicView,
    (value) => value,
  )
  const { component: searchComponent, filter: searchFilter } = useSearch<Topic>(
    (topic) => topic.title + topic.description,
  )

  const { topics: topicsDB } = useAuth()
  const topicListQuery = topicsDB!.useList(projectID, meetingID)

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

  const topics = topicListQuery.data.data.filter(searchFilter)

  return (
    <section className="space-y-4">
      <Flex x={4} justify="between">
        <BadgeHeader
          title="Topics"
          className="text-2xl font-semibold"
          badge={topics.length}
        />
        <ButtonGroup>
          <Button
            startContent={<BsTable />}
            variant={topicViewMode === "table" ? "solid" : "bordered"}
            onClick={() => setTopicViewMode("table")}
          >
            Table
          </Button>
          <Button
            startContent={<BsGrid />}
            variant={topicViewMode === "grid" ? "solid" : "bordered"}
            onClick={() => setTopicViewMode("grid")}
          >
            Grid
          </Button>
        </ButtonGroup>
      </Flex>
      {searchComponent}
      {topicViewMode === "table" ? (
        <TopicTable projectID={projectID} topics={topics} />
      ) : (
        <TopicGrid projectID={projectID} topics={topics} />
      )}
    </section>
  )
}
