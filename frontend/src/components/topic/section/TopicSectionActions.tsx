import Link from "next/link"

import { Action, Topic } from "@/api/types"
import Hr from "@/components/ui/Hr"
import Removable from "@/components/ui/Removable"
import { PriorityTag, TagContainer } from "@/components/ui/tag/Tag"
import TagList from "@/components/ui/tag/TagList"
import { TruncateTitle } from "@/components/ui/text/TruncateText"
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
  const { useActionLinkTopicMut } = useAuth()
  const unlinkActionMut = useActionLinkTopicMut!(projectID)

  return (
    <>
      <TagList>
        {actions.map((action) => (
          <div
            key={topic.ID}
            className="w-fit py-2 px-2 flex flex-col space-x-2 space-y-1 bg-neutral-900 border border-neutral-700 rounded-md max-w-sm"
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
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center text-neutral-400 space-x-2">
                    <div>
                      <TagContainer
                        style="color"
                        color={action.closed_at.Valid ? "#ef4444" : "#22c55e"}
                        className="text-xs"
                      >
                        {action.closed_at.Valid ? "Closed" : "Open"}
                      </TagContainer>
                    </div>
                    <div className="flex flex-col">
                      <TruncateTitle truncate={30} className="text-sm">
                        {action.title}
                      </TruncateTitle>
                    </div>
                  </div>

                  {(!!action.priority_id || action.tags?.length > 0) && (
                    <div>
                      <Hr className="py-1" />
                      <TagList>
                        {action.priority && (
                          <PriorityTag priority={action.priority} />
                        )}
                        {action.tags?.map((tag) => (
                          <TagContainer
                            key={tag.ID}
                            style="color-border"
                            color={tag.color}
                            className="text-xs"
                          >
                            {tag.title}
                          </TagContainer>
                        ))}
                      </TagList>
                    </div>
                  )}
                </div>
              </Removable>
            </Link>
          </div>
        ))}
      </TagList>
    </>
  )
}
