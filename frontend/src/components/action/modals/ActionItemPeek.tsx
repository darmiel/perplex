import Link from "next/link"

import { Action } from "@/api/types"
import ActionTag from "@/components/action/ActionTag"
import CommentSuite from "@/components/comment/CommentSuite"
import ResolveUserName from "@/components/resolve/ResolveUserName"
import Button from "@/components/ui/Button"
import { RelativeDate } from "@/components/ui/DateString"
import Hr from "@/components/ui/Hr"
import ModalContainer from "@/components/ui/modal/ModalContainer"
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
    <ModalContainer title="">
      <div className="flex flex-col space-y-4">
        <div className="flex space-x-2 items-center">
          <ActionTag action={action} />
          <h2 className="font-semibold text-xl">{action.title}</h2>
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

        <div className="w-full p-3 bg-neutral-950">
          <RenderMarkdown markdown={action.description || "*no description*"} />
        </div>

        <CommentSuite
          projectID={action.project_id}
          commentType="action"
          commentEntityID={action.ID}
        />

        <div className="flex justify-between">
          <Button style="secondary" onClick={onClose}>
            Close
          </Button>
          <Link
            href={`/project/${action.project_id}/action/${action.ID}`}
            className="px-3 py-2 bg-transparent hover:bg-neutral-800 rounded-md"
          >
            Open Action
          </Link>
        </div>
      </div>
    </ModalContainer>
  )
}
