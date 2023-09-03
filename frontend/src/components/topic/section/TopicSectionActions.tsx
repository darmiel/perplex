import Link from "next/link"

import { Action, Topic } from "@/api/types"
import ActionListItemSmall from "@/components/action/ActionListItemSmall"
import Removable from "@/components/ui/Removable"
import { useAuth } from "@/contexts/AuthContext"

export default function TopicSectionActions({
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
        <div
          key={topic.ID}
          className="p-2 flex flex-col space-x-2 space-y-1 bg-neutral-900 border border-neutral-700 rounded-md max-w-sm"
        >
          <Link href={`/project/${action.project_id}/action/${action.ID}`}>
            <Removable
              onRemove={() =>
                unlinkActionMut.mutate({
                  link: false,
                  actionID: action.ID,
                  meetingID: topic.meeting_id,
                  topicID: topic.ID,
                })
              }
              loading={unlinkActionMut.isLoading}
            >
              <ActionListItemSmall action={action} />
            </Removable>
          </Link>
        </div>
      ))}
    </div>
  )
}
