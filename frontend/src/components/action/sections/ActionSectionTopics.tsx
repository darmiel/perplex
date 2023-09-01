import Link from "next/link"

import { Action } from "@/api/types"
import Removable from "@/components/ui/Removable"
import { TruncateTitle } from "@/components/ui/text/TruncateText"
import { useAuth } from "@/contexts/AuthContext"

export default function ActionSectionTopics({ action }: { action: Action }) {
  const { useActionLinkTopicMut } = useAuth()

  const linkTopicMut = useActionLinkTopicMut!(action.project_id)

  return (
    <>
      <div className="flex flex-col space-y-2">
        {action.topics.map((topic) => (
          <Removable
            key={topic.ID}
            onRemove={() =>
              linkTopicMut.mutate({
                actionID: action.ID,
                meetingID: topic.meeting_id,
                topicID: topic.ID,
                link: false,
              })
            }
            loading={linkTopicMut.isLoading}
          >
            <div className="w-full px-2 py-1 flex flex-row items-center space-x-2 space-y-1 border border-neutral-700 rounded-md">
              <div>
                <Link
                  href={`/project/${action.project_id}/meeting/${topic.meeting_id}`}
                  className="text-xs text-neutral-400 px-2 py-1 bg-neutral-700 rounded-md w-fit"
                >
                  #{topic.meeting_id}
                </Link>
              </div>
              <Link
                href={`/project/${action.project_id}/meeting/${topic.meeting_id}/topic/${topic.ID}`}
              >
                <TruncateTitle truncate={20} className="">
                  {topic.title}
                </TruncateTitle>
              </Link>
            </div>
          </Removable>
        ))}
      </div>
    </>
  )
}
