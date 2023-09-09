import Link from "next/link"

import { Action, Topic } from "@/api/types"
import ActionCardLarge from "@/components/action/cards/ActionCardLarge"
import { useAuth } from "@/contexts/AuthContext"

export default function TopicSectionLinkedActions({
  projectID,
  topic,
  actions,
}: {
  projectID: number
  topic: Topic
  actions: Action[]
}) {
  const { actions: actionsDB } = useAuth()
  const unlinkActionMut = actionsDB!.useLinkTopic(projectID)

  return (
    <div className="flex space-x-2 overflow-y-auto">
      {actions.map((action) => (
        <Link
          key={action.ID}
          href={`/project/${action.project_id}/action/${action.ID}`}
          className="max-w-sm"
        >
          <ActionCardLarge
            hideProjectName
            className="w-80 max-w-sm"
            action={action}
            onClick={() => {}}
          />
        </Link>
      ))}
    </div>
  )
}
