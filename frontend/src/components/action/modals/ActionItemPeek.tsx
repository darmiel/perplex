import { ScrollShadow } from "@nextui-org/react"
import Link from "next/link"

import { Action } from "@/api/types"
import ActionTag from "@/components/action/ActionTag"
import CommentSuite from "@/components/comment/CommentSuite"
import ResolveUserName from "@/components/resolve/ResolveUserName"
import Button from "@/components/ui/Button"
import { RelativeDate } from "@/components/ui/DateString"
import Hr from "@/components/ui/Hr"
import { PriorityTag, TagContainer } from "@/components/ui/tag/Tag"
import TagList from "@/components/ui/tag/TagList"
import RenderMarkdown from "@/components/ui/text/RenderMarkdown"

export default function ActionPeekModal({
  action,
  onClose,
}: {
  action: Action
  onClose: () => void
}) {
  return (
    <div
      className={`w-[40rem] space-y-6 rounded-md border border-neutral-800 bg-neutral-950 p-4`}
    >
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <ActionTag action={action} />
          <h2 className="text-xl font-semibold">{action.title}</h2>
        </div>
        <span>
          Created by{" "}
          <span className="text-neutral-400">
            <ResolveUserName userID={action.creator_id} />
          </span>{" "}
          - <RelativeDate date={new Date(action.CreatedAt)} />
        </span>
        <TagList>
          {!!action.priority_id && (
            <span className="w-fit">
              <PriorityTag priority={action.priority!} />
            </span>
          )}
          {action.tags.map((tag) => (
            <TagContainer
              key={tag.ID}
              style="color"
              color={tag.color}
              className="text-xs"
            >
              {tag.title}
            </TagContainer>
          ))}
        </TagList>

        <Hr />

        <div className="w-full bg-neutral-950 p-3">
          <RenderMarkdown markdown={action.description || "*no description*"} />
        </div>

        <ScrollShadow className="max-h-64">
          <CommentSuite
            projectID={action.project_id}
            commentType="action"
            commentEntityID={action.ID}
          />
        </ScrollShadow>

        <div className="flex justify-between">
          <Button style="neutral" onClick={onClose}>
            Close
          </Button>
          <Link
            href={`/project/${action.project_id}/action/${action.ID}`}
            className="rounded-md bg-transparent px-3 py-2 hover:bg-neutral-800"
          >
            Open Action
          </Link>
        </div>
      </div>
    </div>
  )
}
