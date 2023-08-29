import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { AxiosError } from "axios"
import { forwardRef, useState } from "react"
import ReactDatePicker from "react-datepicker"
import {
  BsArrowRight,
  BsCheckCircleFill,
  BsCircleFill,
  BsTriangle,
  BsXCircleFill,
} from "react-icons/bs"
import { BarLoader, ClipLoader } from "react-spinners"
import { toast } from "react-toastify"

import { Action, BackendResponse, Priority, Tag, User } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import Button from "@/components/ui/Button"
import { CheckableCardContainer } from "@/components/ui/card/CheckableCardContainer"
import ModalContainer from "@/components/ui/modal/ModalContainer"
import TagList from "@/components/ui/tag/TagList"
import { useAuth } from "@/contexts/AuthContext"

function getIconForMutation<A, B, C, D>(
  mutation: UseMutationResult<A, B, C, D>,
) {
  return mutation.isLoading ? (
    <span className="text-orange-500">
      <ClipLoader />
    </span>
  ) : mutation.isSuccess ? (
    <span className="text-primary-500">
      <BsCheckCircleFill />
    </span>
  ) : mutation.isError ? (
    <span className="text-red-500">
      <BsXCircleFill />
    </span>
  ) : (
    <span className="text-neutral-500">
      <BsCircleFill />
    </span>
  )
}

export default function ActionCreateModal({
  projectID,
  topicID,
  onClose,
}: {
  projectID: string
  topicID: string
  onClose: () => void
}) {
  const [actionTitle, setActionTitle] = useState<string>("")
  const [actionDescription, setActionDescription] = useState<string>("")
  const [actionDueDate, setActionDueDate] = useState<string>("")
  const [actionPriorityID, setActionPriorityID] = useState<number | null>(null)
  const [actionUserAssigned, setActionUserAssigned] = useState<string[]>([])
  const [actionTagAssigned, setActionTagsAssigned] = useState<string[]>([])

  const { axios, projectUsersQueryFn, projectUsersQueryKey } = useAuth()
  const queryClient = useQueryClient()

  const createActionMutation = useMutation<
    BackendResponse<Action>,
    AxiosError<BackendResponse>
  >({
    mutationKey: [{ projectID }, "create-action-mut"],
    mutationFn: async () =>
      (
        await axios!.post(`/project/${projectID}/action`, {
          title: actionTitle,
          description: actionDescription,
          due_date: actionDueDate ? new Date(actionDueDate) : null,
          priority_id: actionPriorityID || 0,
        })
      ).data,
    onSuccess: (data: BackendResponse<Action>) => {
      toast(`Action #${data.data.ID} Created`, { type: "success" })
      queryClient.invalidateQueries([{ projectID }, "actions"])

      // clear form
      setActionTitle("")
      setActionDescription("")

      // link topic
      linkActionMut.mutate({ actionID: data.data.ID })

      // assign users
      for (const userID of actionUserAssigned) {
        assignUserMut.mutate({ actionID: data.data.ID, userID })
      }

      // assign tags
      for (const tagID of actionTagAssigned) {
        assignTagMut.mutate({ actionID: String(data.data.ID), tagID })
      }
    },
  })

  const linkActionMut = useMutation<
    BackendResponse,
    AxiosError,
    { actionID: number }
  >({
    mutationKey: [{ topicID: String(topicID) }, "link-action-mut"],
    mutationFn: async ({ actionID }) =>
      (
        await axios!.post(
          `/project/${projectID}/action/${actionID}/topic/${topicID}`,
        )
      ).data,
    onSuccess: (_, { actionID }) => {
      toast(`Topic #${topicID} linked to #${actionID}`, { type: "success" })
      queryClient.invalidateQueries([{ actionID: String(actionID) }])
      queryClient.invalidateQueries([
        { projectID: String(projectID) },
        "actions",
      ])
      queryClient.invalidateQueries([{ topicID }, "actions"])
    },
    onError: (error) => {
      toast(
        <>
          <strong>Cannot link Topic to Action:</strong>
          <pre>{extractErrorMessage(error)}</pre>
        </>,
        { type: "error" },
      )
    },
  })

  const assignUserMut = useMutation<
    BackendResponse<never>,
    AxiosError,
    { actionID: number; userID: string }
  >({
    mutationKey: [{ actionID: "unknown" }, "assign-user-mut"],
    mutationFn: async ({ actionID, userID }) =>
      (
        await axios!.post(
          `/project/${projectID}/action/${actionID}/user/${userID}`,
        )
      ).data,
    onSuccess: (_, { actionID }) => {
      queryClient.invalidateQueries([{ actionID: String(actionID) }])
      queryClient.invalidateQueries([
        { projectID: String(projectID) },
        "actions",
      ])
    },
    onError(err) {
      toast(
        <>
          <strong>Failed to assign User</strong>
          <pre>{extractErrorMessage(err)}</pre>
        </>,
        { type: "error" },
      )
    },
  })

  const assignTagMut = useMutation<
    BackendResponse<never>,
    AxiosError,
    { actionID: string; tagID: string }
  >({
    mutationKey: [{ actionID: "unknown" }, "assign-tag-mut"],
    mutationFn: async ({ actionID, tagID }) =>
      (
        await axios!.post(
          `/project/${projectID}/action/${actionID}/tag/${tagID}`,
        )
      ).data,
    onSuccess: (_, { actionID }) => {
      queryClient.invalidateQueries([{ actionID }])
      queryClient.invalidateQueries([{ projectID: projectID }, "actions"])
    },
    onError(err) {
      toast(
        <>
          <strong>Failed to assign Tag</strong>
          <pre>{extractErrorMessage(err)}</pre>
        </>,
        { type: "error" },
      )
    },
  })

  // users in project
  const projectUsersQuery = useQuery<BackendResponse<User[]>>({
    queryKey: projectUsersQueryKey!(projectID),
    queryFn: projectUsersQueryFn!(projectID),
  })

  // get tags for the project
  const projectTagsQuery = useQuery<BackendResponse<Tag[]>>({
    queryKey: [{ projectID }, "tags"],
    queryFn: async () => (await axios!.get(`/project/${projectID}/tag`)).data,
  })

  // get priorities for the project
  const projectPrioritiesQuery = useQuery<BackendResponse<Priority[]>>({
    queryKey: [{ projectID }, "priorities"],
    queryFn: async () =>
      (await axios!.get(`/project/${projectID}/priority`)).data,
  })

  function addUser(userID: string) {
    setActionUserAssigned((old) => [...old, userID])
  }

  function removeUser(userID: string) {
    setActionUserAssigned((old) => old.filter((u) => u !== userID))
  }

  function addTag(tagID: number) {
    setActionTagsAssigned((old) => [...old, String(tagID)])
  }

  function removeTag(tagID: number) {
    setActionTagsAssigned((old) => old.filter((t) => t !== String(tagID)))
  }

  // I really tried to type this, but it's just too much work
  // and I don't have the time to do it
  // @ts-ignore
  // eslint-disable-next-line
  const PickerCustomInput = forwardRef(({ value, onClick }, ref) => (
    <button
      className="w-full border border-neutral-600 bg-neutral-800 rounded-lg p-2"
      onClick={onClick}
      // @ts-ignore
      ref={ref}
    >
      {value}
    </button>
  ))

  return (
    <ModalContainer title={`Create Action for Topic ${topicID}`}>
      <div className="flex space-x-10">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-neutral-400" htmlFor="actionTitle">
              Action Title
            </label>
            <input
              id="actionTitle"
              type="text"
              className="w-full border border-neutral-600 bg-neutral-800 rounded-lg p-2"
              placeholder="My awesome Action"
              onChange={(event) => setActionTitle(event.target.value)}
              value={actionTitle}
            />
          </div>

          <div className="space-y-2">
            <label className="text-neutral-400" htmlFor="actionDescription">
              Action Description
            </label>
            <textarea
              id="actionDescription"
              className="w-full border border-neutral-600 bg-neutral-800 rounded-lg p-2"
              placeholder="(Markdown is supported)"
              rows={10}
              onChange={(event) => setActionDescription(event.target.value)}
              value={actionDescription}
            />
          </div>
        </div>
        <div className="space-y-4">
          {/* Priority and Due Date */}
          <div className="flex space-x-4">
            {/* Priority */}
            <div className="space-y-2 flex flex-col">
              <label className="text-neutral-400" htmlFor="actionPriority">
                Action Priority
              </label>
              <select
                id="actionPriority"
                className="w-fit bg-neutral-800 border border-neutral-600 rounded-lg p-2"
                defaultValue="0"
                onChange={(e) => setActionPriorityID(Number(e.target.value))}
              >
                <option value="0">No Priority</option>
                {projectPrioritiesQuery.data?.data.map((priority) => (
                  <option key={priority.ID} value={priority.ID}>
                    {priority.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <label className="text-neutral-400" htmlFor="topicDate">
                Action Due Date
              </label>
              <div className="flex items-center space-x-4">
                <ReactDatePicker
                  selected={actionDueDate ? new Date(actionDueDate) : undefined}
                  onChange={(date) => setActionDueDate(date?.toString() || "")}
                  timeInputLabel="Time:"
                  dateFormat="MM/dd/yyyy h:mm aa"
                  customInput={<PickerCustomInput />}
                  showTimeInput
                />
                {actionDueDate && (
                  <Button onClick={() => setActionDueDate("")}>
                    No Due Date
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Assign Tags */}
          <div className="space-y-2 max-w-md">
            <span className="text-neutral-400">Assign Tags</span>
            <div className="flex flex-row space-x-4 max-w-xl">
              {projectTagsQuery.isLoading ? (
                <BarLoader color="white" />
              ) : (
                <TagList>
                  {projectTagsQuery.data?.data.map((tag, key) => (
                    <CheckableCardContainer
                      key={key}
                      htmlStyle={{
                        borderColor: tag.color ?? "gray",
                      }}
                      checked={actionTagAssigned.includes(String(tag.ID))}
                      onToggle={(toggled) =>
                        toggled ? addTag(tag.ID) : removeTag(tag.ID)
                      }
                    >
                      {tag.title}
                    </CheckableCardContainer>
                  ))}
                </TagList>
              )}
            </div>
          </div>

          {/* Assign Users */}
          <div className="space-y-2 max-w-md">
            <span className="text-neutral-400">Assign Users</span>
            <div className="flex flex-row space-x-4 max-w-xl">
              {projectUsersQuery.isLoading ? (
                <BarLoader color="white" />
              ) : (
                <TagList>
                  {projectUsersQuery.data?.data.map((user, key) => (
                    <CheckableCardContainer
                      key={key}
                      checked={actionUserAssigned.includes(user.id)}
                      onToggle={(toggled) =>
                        toggled ? addUser(user.id) : removeUser(user.id)
                      }
                    >
                      {user.name}
                    </CheckableCardContainer>
                  ))}
                </TagList>
              )}
            </div>
          </div>
        </div>
      </div>

      <hr className="border-neutral-600" />

      <ol className="flex items-center justify-between w-full text-sm font-medium text-center text-gray-400">
        <li className="flex items-center space-x-2">
          {getIconForMutation(createActionMutation)}
          <span>Action Creation</span>
        </li>
        <li>
          <BsArrowRight />
        </li>
        <li className="flex items-center space-x-2">
          {getIconForMutation(linkActionMut)}
          <span>Project Linking</span>
        </li>
        <li>
          <BsArrowRight />
        </li>
        <li className="flex items-center space-x-2">
          {getIconForMutation(assignTagMut)}
          <span>Tags Assignment</span>
        </li>
        <li>
          <BsArrowRight />
        </li>
        <li className="flex items-center space-x-2">
          {getIconForMutation(assignUserMut)}
          <span>User Assignment</span>
        </li>
      </ol>

      {createActionMutation.isError && (
        <div className="text-red-500 text-sm font-bold flex items-center space-x-2">
          <div>
            <BsTriangle />
          </div>
          <div>{extractErrorMessage(createActionMutation.error)}</div>
        </div>
      )}

      <div className="flex flex-row space-x-4 justify-between">
        <Button style="neutral" onClick={onClose}>
          Close
        </Button>
        <Button
          style="secondary"
          isLoading={
            createActionMutation.isLoading ||
            linkActionMut.isLoading ||
            assignTagMut.isLoading ||
            assignUserMut.isLoading
          }
          onClick={() => createActionMutation.mutate()}
        >
          Create
        </Button>
      </div>
    </ModalContainer>
  )
}
