import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useState } from "react"
import { BsBookmarkStar, BsBookmarkStarFill, BsPen } from "react-icons/bs"
import { BarLoader } from "react-spinners"
import { toast } from "react-toastify"

import { BackendResponse, CommentType, Topic } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import TopicCommentBox from "@/components/topic/comment/TopicCommentBox"
import TopicCommentList from "@/components/topic/comment/TopicCommentList"
import RenderMarkdown from "@/components/ui/text/RenderMarkdown"
import { useAuth } from "@/contexts/AuthContext"

import Button from "../ui/Button"
import OverviewContainer from "../ui/overview/OverviewContainer"
import OverviewContent from "../ui/overview/OverviewContent"
import OverviewSection from "../ui/overview/OverviewSection"
import OverviewSide from "../ui/overview/OverviewSide"
import Tag from "../ui/Tag"
import FetchUserTag from "../user/FetchUserTag"
import MultiUserSelect from "../user/MultiUserSelect"
import UserTag from "../user/UserTag"
import { AckTopicTypeCard, DiscussTopicTypeCard } from "./CreateTopic"

const tags = {
  open: {
    icon: <BsBookmarkStar />,
    text: "Open",
    className: "bg-green-600 text-white",
  },
  close: {
    icon: <BsBookmarkStarFill />,
    text: "Closed",
    className: "bg-red-600 text-white",
  },
}

function SectionParticipants({
  projectID,
  meetingID,
  topicID,
}: {
  projectID: string
  meetingID: string
  topicID: string
}) {
  const { commentListQueryFn, commentListQueryKey } = useAuth()
  const commentListQuery = useQuery<BackendResponse<CommentType[]>>({
    queryKey: commentListQueryKey!(projectID, meetingID, topicID),
    queryFn: commentListQueryFn!(projectID, meetingID, topicID),
  })
  if (commentListQuery.isLoading) {
    return <BarLoader color="white" />
  }
  if (commentListQuery.isError) {
    return (
      <div>
        Error: <pre>{extractErrorMessage(commentListQuery.error)}</pre>
      </div>
    )
  }
  const userIDs = new Set<string>()
  for (const comment of commentListQuery.data.data) {
    userIDs.add(comment.author_id)
  }
  return (
    <div className="flex flex-row space-x-2">
      {Array.from(userIDs).map((userID) => (
        <FetchUserTag key={userID} userID={userID} />
      ))}
    </div>
  )
}

function SectionAuthor({ topic }: { topic: Topic }) {
  return (
    <div className="w-fit">
      <UserTag
        userID={topic.creator?.id ?? ""}
        displayName={topic.creator?.name ?? "Unknown User"}
      />
    </div>
  )
}

function SectionAssigned({
  topic,
  projectID,
  meetingID,
  topicID,
}: {
  topic: Topic
  projectID: string
  meetingID: string
  topicID: string
}) {
  return (
    <div className="flex flex-row space-x-2">
      {topic.assigned_users.length > 0 && (
        <div className="flex flex-row items-center">
          {topic.assigned_users.map((user) => (
            <UserTag key={user.id} userID={user.id} displayName={user.name} />
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
  )
}

export default function TopicOverview({
  projectID,
  meetingID,
  topicID,
}: {
  projectID: string
  meetingID: string
  topicID: string
}) {
  const [isEdit, setIsEdit] = useState(false)

  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editForceSolution, setEditForceSolution] = useState(false)

  const { topicInfoQueryFn, topicInfoQueryKey, axios } = useAuth()
  const topicInfoQuery = useQuery<BackendResponse<Topic>>({
    queryKey: topicInfoQueryKey!(projectID, meetingID, topicID),
    queryFn: topicInfoQueryFn!(projectID, meetingID, topicID),
  })

  const queryClient = useQueryClient()
  const topicUpdateMutation = useMutation<BackendResponse<never>, AxiosError>({
    mutationFn: async () =>
      (
        await axios!.put(
          `/project/${projectID}/meeting/${meetingID}/topic/${topicID}`,
          {
            title: editTitle,
            description: editDescription,
            force_solution: editForceSolution,
          },
        )
      ).data,
    onError: (err, variables, context) => {
      toast(
        <>
          <strong>Failed to update topic</strong>
          <pre>{extractErrorMessage(err)}</pre>
        </>,
        { type: "error" },
      )
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(
        topicInfoQueryKey!(projectID, meetingID, topicID),
      )
      setIsEdit(false)
    },
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

  const tag = topic.closed_at.Valid ? tags.close : tags.open
  const dateCreated = new Date(topic.CreatedAt)

  function enterEdit() {
    setEditTitle(topic.title)
    setEditDescription(topic.description)
    setEditForceSolution(topic.force_solution || false)

    setIsEdit(true)
  }

  return (
    <div className="flex flex-col">
      {isEdit ? (
        <div className="flex space-x-2">
          <AckTopicTypeCard
            selected={!editForceSolution}
            onClick={() => setEditForceSolution(false)}
          />
          <DiscussTopicTypeCard
            selected={editForceSolution}
            onClick={() => setEditForceSolution(true)}
          />
        </div>
      ) : (
        <span className="text-xs text-primary-500">
          {topic.force_solution ? "Discuss" : "Acknowledge"}
        </span>
      )}

      <h1 className="text-2xl mt-1 space-x-2">
        {isEdit ? (
          <input
            className="w-full bg-transparent border-b border-gray-700 focus:outline-none"
            defaultValue={topic.title}
            onChange={(e) => setEditTitle(e.target.value)}
          />
        ) : (
          <span className="font-bold">{topic.title}</span>
        )}
        <span className="text-neutral-400">#{topic.ID}</span>
      </h1>

      <div className="flex flex-row items-center text-neutral-500 space-x-1 mt-2">
        <Tag className={tag.className}>
          <div>{tag.icon}</div>
          <div>{tag.text}</div>
        </Tag>
        {topic.creator?.name && (
          <>
            <span className="font-semibold">{topic.creator.name}</span>
            <span>created on</span>
          </>
        )}
        <span className="font-semibold">
          {dateCreated.toLocaleDateString()}
        </span>
        <span>at</span>
        <span className="font-semibold">
          {dateCreated.toLocaleTimeString()}
        </span>
      </div>

      <hr className="my-4 border-gray-700" />

      <OverviewContainer>
        <OverviewContent>
          <div className="text-neutral-500 p-2 bg-neutral-900">
            {isEdit ? (
              <textarea
                className="w-full bg-transparent focus:outline-none"
                defaultValue={topic.description}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            ) : (
              <RenderMarkdown markdown={topic.description} />
            )}
          </div>

          <TopicCommentBox className="mt-4" key={topicID} {...topicInfoProps} />

          <TopicCommentList
            className="mt-4"
            {...topicInfoProps}
            topicSolutionCommentID={topic.solution_id}
          />
        </OverviewContent>
        <OverviewSide>
          <OverviewSection name="Edit">
            {!isEdit ? (
              <Button
                className="w-full text-sm"
                icon={<BsPen />}
                onClick={() => enterEdit()}
              >
                Edit Topic
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button
                  className="w-1/2 text-sm"
                  style="primary"
                  onClick={() => topicUpdateMutation.mutate()}
                  isLoading={topicUpdateMutation.isLoading}
                >
                  Save
                </Button>
                <Button
                  className="w-1/2 text-sm"
                  style="neutral"
                  onClick={() => setIsEdit(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </OverviewSection>
          <OverviewSection name="Author">
            <SectionAuthor topic={topic} />
          </OverviewSection>
          <OverviewSection name="Assigned">
            <SectionAssigned {...topicInfoProps} topic={topic} />
          </OverviewSection>
          <OverviewSection name="Participants">
            <SectionParticipants {...topicInfoProps} />
          </OverviewSection>
        </OverviewSide>
      </OverviewContainer>
    </div>
  )
}
