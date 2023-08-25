import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useState } from "react"
import { BsCheck2Circle, BsTriangle } from "react-icons/bs"
import { GoDiscussionClosed } from "react-icons/go"
import { BarLoader } from "react-spinners"
import { toast } from "react-toastify"

import { BackendResponse, Topic, User } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import { useAuth } from "@/contexts/AuthContext"

import Button from "../ui/Button"
import CardContainer from "../ui/card/CardContainer"
import { CheckableCardContainer } from "../ui/card/CheckableCardContainer"
import ModalContainer from "../ui/modal/ModalContainer"

type TopicType = "acknowledge" | "discuss"

export function TopicTypeCard({
  title,
  subtitle,
  icon,
  selected = false,
  onClick,
}: {
  title: string
  subtitle: string
  icon: JSX.Element
  selected?: boolean
  onClick?: () => void
}) {
  return (
    <CardContainer
      onClick={() => onClick?.()}
      style={selected ? "selected-border" : "neutral"}
    >
      <div className="flex flex-row items-center space-x-3">
        <div className={selected ? "text-primary-600" : "text-neutral-400"}>
          {icon}
        </div>
        <div>
          <h2 className="font-bold">{title}</h2>
          <span className="text-neutral-400 text-sm">{subtitle}</span>
        </div>
      </div>
    </CardContainer>
  )
}

export function AckTopicTypeCard({
  selected,
  onClick,
}: {
  selected: boolean
  onClick?: () => void
}) {
  return (
    <TopicTypeCard
      title="Acknowledge"
      subtitle="Just share some information."
      icon={<BsCheck2Circle size="1.3em" />}
      onClick={onClick}
      selected={selected}
    />
  )
}

export function DiscussTopicTypeCard({
  selected,
  onClick,
}: {
  selected: boolean
  onClick?: () => void
}) {
  return (
    <TopicTypeCard
      title="Discuss"
      subtitle="Solution required to close topic"
      icon={<GoDiscussionClosed size="1.3em" />}
      onClick={onClick}
      selected={selected}
    />
  )
}

export default function CreateTopic({
  projectID,
  meetingID,
  onClose,
}: {
  projectID: string
  meetingID: string
  onClose: (newTopicID: number) => void
}) {
  const [topicTitle, setTopicTitle] = useState<string>("")
  const [topicDescription, setTopicDescription] = useState<string>("")
  const [topicType, setTopicType] = useState<TopicType>("acknowledge")
  const [topicAssigned, setTopicAssigned] = useState<string[]>([])

  const {
    createTopicMutFn,
    createTopicMutKey,
    assignTopicMutFn,
    assignTopicMutKey,
    projectInfoQueryFn,
    projectInfoQueryKey,
    topicListQueryKey,
    topicInfoQueryKey,
  } = useAuth()
  const queryClient = useQueryClient()

  const assignMutation = useMutation<
    BackendResponse,
    AxiosError,
    { userIDs: string[]; topicID: number }
  >({
    mutationKey: assignTopicMutKey!(projectID, meetingID),
    mutationFn: assignTopicMutFn!(projectID, meetingID),
    onSuccess(_, { topicID }) {
      queryClient.invalidateQueries(topicListQueryKey!(projectID, meetingID))
      queryClient.invalidateQueries(
        topicInfoQueryKey!(projectID, meetingID, topicID),
      )
    },
  })

  const createTopicMutation = useMutation<
    BackendResponse<Topic>,
    AxiosError<BackendResponse>,
    boolean
  >({
    mutationKey: createTopicMutKey!(projectID, meetingID),
    mutationFn: createTopicMutFn!(
      projectID,
      meetingID,
      topicTitle,
      topicDescription,
      topicType === "discuss",
    ),
    onSuccess: (data: BackendResponse<Topic>, shouldClose: boolean) => {
      // assign users
      assignMutation.mutate({
        userIDs: topicAssigned,
        topicID: data.data.ID,
      })

      toast(`Topic #${data.data.ID} Created`, { type: "success" })
      queryClient.invalidateQueries(topicListQueryKey!(projectID, meetingID))

      // clear form
      setTopicTitle("")
      setTopicDescription("")

      shouldClose && onClose?.(data.data.ID)
    },
  })

  // users in project
  const projectInfoQuery = useQuery<BackendResponse<User[]>>({
    queryKey: projectInfoQueryKey!(projectID),
    queryFn: projectInfoQueryFn!(projectID),
  })

  function addUser(userID: string) {
    setTopicAssigned((old) => [...old, userID])
  }

  function removeUser(userID: string) {
    setTopicAssigned((old) => old.filter((u) => u !== userID))
  }

  return (
    <ModalContainer title="Create Topic">
      <div className="space-y-2">
        <label className="text-neutral-400" htmlFor="topicName">
          Topic Name
        </label>
        <input
          id="topicName"
          type="text"
          className="w-full border border-neutral-600 bg-neutral-800 rounded-lg p-2"
          placeholder="My awesome Topic"
          onChange={(event) => setTopicTitle(event.target.value)}
          value={topicTitle}
        />
      </div>

      <div className="space-y-2">
        <label className="text-neutral-400" htmlFor="topicDescription">
          Topic Description
        </label>
        <textarea
          id="topicDescription"
          className="w-full border border-neutral-600 bg-neutral-800 rounded-lg p-2"
          placeholder="(Markdown is supported)"
          rows={10}
          onChange={(event) => setTopicDescription(event.target.value)}
          value={topicDescription}
        />
      </div>

      <div className="space-y-2">
        <label className="text-neutral-400" htmlFor="topicType">
          Topic Type
        </label>
        <div className="flex flex-row space-x-4">
          <AckTopicTypeCard
            selected={topicType === "acknowledge"}
            onClick={() => setTopicType("acknowledge")}
          />
          <DiscussTopicTypeCard
            selected={topicType === "discuss"}
            onClick={() => setTopicType("discuss")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-neutral-400">Assign</span>
        <div className="flex flex-row space-x-4">
          {projectInfoQuery.isLoading ? (
            <BarLoader color="white" />
          ) : (
            projectInfoQuery.data?.data.map((user, key) => (
              <CheckableCardContainer
                key={key}
                checked={topicAssigned.includes(user.id)}
                onToggle={(toggled) =>
                  toggled ? addUser(user.id) : removeUser(user.id)
                }
              >
                {user.name}
              </CheckableCardContainer>
            ))
          )}
        </div>
      </div>
      <hr className="border-neutral-600" />
      {createTopicMutation.isError && (
        <div className="text-red-500 text-sm font-bold flex items-center space-x-2">
          <div>
            <BsTriangle />
          </div>
          <div>{extractErrorMessage(createTopicMutation.error)}</div>
        </div>
      )}
      <div className="flex flex-row space-x-4 justify-end">
        <Button
          style="secondary"
          isLoading={createTopicMutation.isLoading}
          onClick={() => createTopicMutation.mutate(true)}
        >
          Save and Close
        </Button>

        <Button
          style="primary"
          isLoading={createTopicMutation.isLoading}
          onClick={() => createTopicMutation.mutate(false)}
        >
          Save and Create New
        </Button>
      </div>
    </ModalContainer>
  )
}
