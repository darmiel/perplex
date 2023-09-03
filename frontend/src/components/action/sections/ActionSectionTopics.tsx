import Link from "next/link"

import { Action } from "@/api/types"
import Removable from "@/components/ui/Removable"
import { TruncateTitle } from "@/components/ui/text/TruncateText"
import { useAuth } from "@/contexts/AuthContext"

export default function ActionSectionTopics({ action }: { action: Action }) {
  const { actions } = useAuth()

  const linkTopicMut = actions!.useLinkTopic(action.project_id)

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
            <div className="flex w-full flex-row items-center space-x-2 space-y-1 rounded-md border border-neutral-700 px-2 py-1">
              <div>
                <Link
                  href={`/project/${action.project_id}/meeting/${topic.meeting_id}`}
                  className="w-fit rounded-md bg-neutral-700 px-2 py-1 text-xs text-neutral-400"
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
