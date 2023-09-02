import Link from "next/link"

import { Action } from "@/api/types"
import ActionTag from "@/components/action/ActionTag"
import { PriorityTag } from "@/components/ui/tag/Tag"
import ResolveUserName from "@/components/user/ResolveUserName"

export default function SearchResultAction({
  action,
  onClick,
}: {
  action: Action
  onClick: () => void
}) {
  return (
    <Link
      href={`/project/${action.project_id}/action/${action.ID}`}
      key={action.ID}
      className="flex items-center space-x-2 p-2 rounded-md hover:bg-neutral-800"
      onClick={() => onClick()}
    >
      <ActionTag action={action} />
      <div className="flex flex-col">
        <h4 className="text-sm">
          <span className="text-white flex space-x-1 items-center">
            <span>{action.title}</span>
            <span className="text-neutral-400">
              by <ResolveUserName userID={action.creator_id} />
            </span>
            {!!action.priority_id && action.priority && (
              <PriorityTag priority={action.priority} />
            )}
          </span>
        </h4>
      </div>
    </Link>
  )
}
