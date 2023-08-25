import { useQuery } from "@tanstack/react-query"

import { BackendResponse, Topic } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import RenderMarkdown from "@/components/text/RenderMarkdown"
import TopicCommentBox from "@/components/topic/comment/TopicCommentBox"
import TopicCommentList from "@/components/topic/comment/TopicCommentList"
import { useAuth } from "@/contexts/AuthContext"

import MultiUserSelect from "../user/MultiUserSelect"
import UserAvatar from "../user/UserAvatar"

export default function TopicOverview({
  projectID,
  meetingID,
  topicID,
}: {
  projectID: string
  meetingID: string
  topicID: string
}) {
  const { axios } = useAuth()
  const topicInfoQuery = useQuery<BackendResponse<Topic>>({
    queryKey: [{ projectID }, { meetingID }, { topicID }],
    queryFn: async () =>
      (
        await axios!.get(
          `/project/${projectID}/meeting/${meetingID}/topic/${topicID}`,
        )
      ).data,
  })
  if (topicInfoQuery.isLoading) {
    return <div>Loading...</div>
  }
  if (topicInfoQuery.isError) {
    return (
      <div>
        Error: <pre>{extractErrorMessage(topicInfoQuery.error)}</pre>
      </div>
    )
  }

  const topic = topicInfoQuery.data.data

  const topicInfoProps = {
    projectID,
    meetingID,
    topicID,
  }

  return (
    <div className="flex flex-col">
      <span className="uppercase text-xs text-primary-500">
        {topic.force_solution ? "Discuss" : "Acknowledge"}
      </span>
      <h1 className="text-2xl font-bold">{topic.title}</h1>

      {/* Print assigned users */}
      <div className="flex flex-row mt-4 space-x-2">
        {topic.assigned_users.length > 0 && (
          <div className="flex flex-row items-center">
            {topic.assigned_users.map((user) => (
              <div
                key={user.id}
                className={`${
                  user.id === user?.id
                    ? "bg-primary-400 bg-opacity-20 border-primary-500 text-primary-500"
                    : "border-neutral-500 text-neutral-500"
                } border rounded-full px-3 py-1 flex flex-row items-center space-x-2`}
              >
                <div>
                  <UserAvatar
                    key={user.id}
                    userID={user.id}
                    className="h-4 w-4"
                  />
                </div>
                <div>
                  <span>{user.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <div>
          <MultiUserSelect
            key={topic.ID}
            projectID={projectID}
            meetingID={meetingID}
            topicID={topicID}
            initialSelection={topic.assigned_users.map((user) => user.id) ?? []}
          >
            <button className="border-neutral-500 text-neutral-500 border rounded-full px-3 py-1 flex flex-row items-center space-x-2">
              Assign
            </button>
          </MultiUserSelect>
        </div>
      </div>

      <span className="text-neutral-500 my-3">
        <RenderMarkdown markdown={topic.description} />
      </span>

      <TopicCommentBox key={topicID} {...topicInfoProps} />

      <TopicCommentList
        {...topicInfoProps}
        topicSolutionCommentID={topic.solution_id}
      />
    </div>
  )
}
