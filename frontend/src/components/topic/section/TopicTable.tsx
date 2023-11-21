import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react"

import { Topic } from "@/api/types"
import TopicTag from "@/components/topic/TopicTag"
import { PriorityTag, TagFromType } from "@/components/ui/tag/Tag"

type SortDescriptor = "title" | "priority" | "creator" | "status"

export function TopicTable({
  projectID,
  topics,
}: {
  projectID: number
  topics: Topic[]
}) {
  return (
    <Table selectionMode="single">
      <TableHeader>
        <TableColumn>Status</TableColumn>
        <TableColumn allowsSorting>Title</TableColumn>
        <TableColumn>Priority</TableColumn>
        <TableColumn>Tags</TableColumn>
      </TableHeader>
      <TableBody emptyContent={<>No Topics in Meeting</>}>
        {topics.map((topic) => (
          <TableRow
            key={topic.ID}
            href={`/project/${projectID}/meeting/${topic.meeting_id}/topic/${topic.ID}`}
            className="cursor-pointer"
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
  )
}
