import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react"
import { ReactNode } from "react"
import { BarLoader } from "react-spinners"

import { Topic } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import TopicTag from "@/components/topic/TopicTag"
import BadgeHeader from "@/components/ui/BadgeHeader"
import Flex from "@/components/ui/layout/Flex"
import useSearch from "@/components/ui/SearchBar"
import { PriorityTag, TagFromType } from "@/components/ui/tag/Tag"
import { useAuth } from "@/contexts/AuthContext"

export function TopicTable({
  projectID,
  meetingID,
  slots,
}: {
  projectID: number
  meetingID: number
  slots?: ReactNode
}) {
  const { topics: topicsDB } = useAuth()
  const { component, filter } = useSearch<Topic>(
    (topic) => topic.title + topic.description,
  )

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

  const topics = topicListQuery.data.data.filter(filter)

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
      {component}
      <Table selectionMode="single">
        <TableHeader>
          <TableColumn>Status</TableColumn>
          <TableColumn>Title</TableColumn>
          <TableColumn>Priority</TableColumn>
          <TableColumn>Tags</TableColumn>
        </TableHeader>
        <TableBody>
          {topics.map((topic) => (
            <TableRow
              key={topic.ID}
              href={`/project/${projectID}/meeting/${meetingID}/topic/${topic.ID}`}
            >
              <TableCell>
                <TopicTag topic={topic} className="w-fit" />
              </TableCell>
              <TableCell>{topic.title}</TableCell>
              <TableCell>
                {!!topic.priority_id && (
                  <PriorityTag priority={topic.priority!} />
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  {topic.tags.map((tag) => (
                    <TagFromType key={tag.ID} tag={tag} />
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  )
}
