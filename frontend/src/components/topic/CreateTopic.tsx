import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useState } from "react"
import { BsCheck2Circle, BsTriangle } from "react-icons/bs"
import { GoDiscussionClosed } from "react-icons/go"
import { BarLoader } from "react-spinners"
import { toast } from "react-toastify"

import { BackendResponse } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import { Topic, User } from "@/components/topic/TopicList"
import { useAuth } from "@/contexts/AuthContext"

import { SimpleCheckBoxCard } from "../controls/card/CheckBoxCard"

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
    <div
      className={`${
        selected
          ? "border border-purple-600"
          : "bg-neutral-800 border border-neutral-600 cursor-pointer"
      }  p-3 rounded-lg`}
      onClick={() => onClick?.()}
    >
      <div className="flex flex-row items-center space-x-3">
        <div className={selected ? "text-purple-600" : "text-neutral-400"}>
          {icon}
        </div>
        <div>
          <h2 className="font-bold">{title}</h2>
          <span className="text-neutral-400 text-sm">{subtitle}</span>
        </div>
      </div>
    </div>
  )
}

type TopicType = "acknowledge" | "discuss"

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

  const { axios } = useAuth()
  const queryClient = useQueryClient()

  const assignMutation = useMutation<
    BackendResponse,
    AxiosError,
    { userIDs: string[]; topicID: number }
  >({
    mutationKey: [{ projectID }, "users-assign"],
    mutationFn: async ({ userIDs, topicID }) =>
      (
        await axios!.post(
          `/project/${projectID}/meeting/${meetingID}/topic/${topicID}/assign`,
          {
            assigned_users: userIDs,
          },
        )
      ).data,
    onSuccess(_, { topicID }) {
      queryClient.invalidateQueries([{ projectID }, { meetingID }, "topics"])
      queryClient.invalidateQueries([{ projectID }, { meetingID }, { topicID }])
    },
  })

  const createTopicMutation = useMutation<
    BackendResponse<Topic>,
    AxiosError<BackendResponse>,
    boolean
  >({
    mutationKey: [{ projectID }, { meetingID }, "topic-create"],
    mutationFn: async () =>
      (
        await axios!.post(`/project/${projectID}/meeting/${meetingID}/topic`, {
          title: topicTitle,
          description: topicDescription,
          force_solution: topicType === "discuss",
        })
      ).data,
    onSuccess: (data: BackendResponse<Topic>, shouldClose: boolean) => {
      // assign users
      assignMutation.mutate({
        userIDs: topicAssigned,
        topicID: data.data.ID,
      })

      toast(`Topic #${data.data.ID} created`, { type: "success" })
      queryClient.invalidateQueries([{ projectID }, { meetingID }, "topics"])

      // clear form
      setTopicTitle("")
      setTopicDescription("")

      shouldClose && onClose?.(data.data.ID)
    },
  })

  // users in project
  const projectInfoQuery = useQuery<BackendResponse<User[]>>({
    queryKey: [{ projectID }, "users"],
    queryFn: async () => (await axios!.get(`/project/${projectID}/users`)).data,
  })

  function addUser(userID: string) {
    setTopicAssigned((old) => [...old, userID])
  }

  function removeUser(userID: string) {
    setTopicAssigned((old) => old.filter((u) => u !== userID))
  }

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-10 w-full space-y-8">
      <h1 className="text-2xl font-bold">Create Topic</h1>

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
          <TopicTypeCard
            title="Acknowledge"
            subtitle="Just share some information."
            icon={<BsCheck2Circle size="1.3em" />}
            selected={topicType === "acknowledge"}
            onClick={() => setTopicType("acknowledge")}
          />
          <TopicTypeCard
            title="Discuss"
            subtitle="Solution required to close topic"
            icon={<GoDiscussionClosed size="1.3em" />}
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
            projectInfoQuery.data?.data.map((user) => (
              <SimpleCheckBoxCard
                key={user.id}
                checked={topicAssigned.includes(user.id)}
                onToggle={(toggled) =>
                  toggled ? addUser(user.id) : removeUser(user.id)
                }
                onClick={() =>
                  topicAssigned.includes(user.id)
                    ? removeUser(user.id)
                    : addUser(user.id)
                }
              >
                {user.name}
              </SimpleCheckBoxCard>
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
        <button
          onClick={() => createTopicMutation.mutate(true)}
          disabled={createTopicMutation.isLoading}
          className="px-4 py-2 border border-purple-600 rounded-md cursor-pointer hover:bg-purple-800"
        >
          {createTopicMutation.isLoading ? <BarLoader /> : "Save and Close"}
        </button>
        <button
          onClick={() => createTopicMutation.mutate(false)}
          disabled={createTopicMutation.isLoading}
          className="px-4 py-2 bg-purple-600 rounded-md cursor-pointer hover:bg-purple-800"
        >
          {createTopicMutation.isLoading ? (
            <BarLoader />
          ) : (
            "Save and Create New"
          )}
        </button>
      </div>
    </div>
  )
}
