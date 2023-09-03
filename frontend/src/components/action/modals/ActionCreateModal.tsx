import { UseMutationResult } from "@tanstack/react-query"
import { useState } from "react"
import ReactDatePicker from "react-datepicker"
import {
  BsArrowRight,
  BsCheckCircleFill,
  BsCircleFill,
  BsTriangle,
  BsXCircleFill,
} from "react-icons/bs"
import { BarLoader, ClipLoader } from "react-spinners"
import { toast } from "sonner"

import { extractErrorMessage, PickerCustomInput } from "@/api/util"
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
  meetingID,
  topicID,
  onClose,
}: {
  projectID: number
  meetingID?: number
  topicID?: number
  onClose: () => void
}) {
  const [actionTitle, setActionTitle] = useState<string>("")
  const [actionDescription, setActionDescription] = useState<string>("")
  const [actionDueDate, setActionDueDate] = useState<string>("")
  const [actionPriorityID, setActionPriorityID] = useState<number>(0)
  const [actionUserAssigned, setActionUserAssigned] = useState<string[]>([])
  const [actionTagAssigned, setActionTagsAssigned] = useState<number[]>([])

  const { actions, projects, tags, priorities } = useAuth()
  const linkTopicToActionMut = actions!.useLinkTopic(projectID)
  const linkUserToActionMut = actions!.useLinkUser(projectID)
  const linkTagToActionMut = actions!.useLinkTag(projectID)
  const usersQuery = projects!.useUserList(projectID)
  const tagsQuery = tags!.useList(projectID)
  const prioritiesQuery = priorities!.useList(projectID)

  const linkTopic = !!topicID && !!meetingID

  const createActionMutation = actions!.useCreate(projectID, ({ data }) => {
    toast.success(`Action #${data.ID} Created`)

    // clear form
    setActionTitle("")
    setActionDescription("")

    // link topic
    if (linkTopic) {
      linkTopicToActionMut.mutate({
        link: true,
        actionID: data.ID,
        topicID,
        meetingID,
      })
    }

    // assign users
    for (const userID of actionUserAssigned) {
      linkUserToActionMut.mutate({
        link: true,
        actionID: data.ID,
        userID,
      })
    }

    // assign tags
    for (const tagID of actionTagAssigned) {
      linkTagToActionMut.mutate({
        link: true,
        actionID: data.ID,
        tagID,
      })
    }
  })

  function addUser(userID: string) {
    setActionUserAssigned((old) => [...old, userID])
  }

  function removeUser(userID: string) {
    setActionUserAssigned((old) => old.filter((u) => u !== userID))
  }

  function addTag(tagID: number) {
    setActionTagsAssigned((old) => [...old, tagID])
  }

  function removeTag(tagID: number) {
    setActionTagsAssigned((old) => old.filter((t) => t !== tagID))
  }

  return (
    <ModalContainer
      title={`Create Action${topicID ? ` for Topic ${topicID}` : ""}`}
    >
      <div className="flex space-x-10">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-neutral-400" htmlFor="actionTitle">
              Action Title
            </label>
            <input
              id="actionTitle"
              type="text"
              className="w-full rounded-lg border border-neutral-600 bg-neutral-800 p-2"
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
              className="w-full rounded-lg border border-neutral-600 bg-neutral-800 p-2"
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
            <div className="flex flex-col space-y-2">
              <label className="text-neutral-400" htmlFor="actionPriority">
                Action Priority
              </label>
              <select
                id="actionPriority"
                className="w-fit rounded-lg border border-neutral-600 bg-neutral-800 p-2"
                defaultValue="0"
                onChange={(e) => setActionPriorityID(Number(e.target.value))}
              >
                <option value="0">No Priority</option>
                {prioritiesQuery.data?.data.map((priority) => (
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
          <div className="max-w-md space-y-2">
            <span className="text-neutral-400">Assign Tags</span>
            <div className="flex max-w-xl flex-row space-x-4">
              {tagsQuery.isLoading ? (
                <BarLoader color="white" />
              ) : (
                <TagList>
                  {tagsQuery.data?.data.map((tag, key) => (
                    <CheckableCardContainer
                      key={key}
                      htmlStyle={{
                        borderColor: tag.color ?? "gray",
                      }}
                      checked={actionTagAssigned.includes(tag.ID)}
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
          <div className="max-w-md space-y-2">
            <span className="text-neutral-400">Assign Users</span>
            <div className="flex max-w-xl flex-row space-x-4">
              {usersQuery.isLoading ? (
                <BarLoader color="white" />
              ) : (
                <TagList>
                  {usersQuery.data?.data.map((user, key) => (
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

      <ol className="flex w-full items-center justify-between text-center text-sm font-medium text-gray-400">
        <li className="flex items-center space-x-2">
          {getIconForMutation(createActionMutation)}
          <span>Action Creation</span>
        </li>
        <li>
          <BsArrowRight />
        </li>
        <>
          <li className="flex items-center space-x-2">
            {getIconForMutation(linkTopicToActionMut)}
            <span>Topic Linking {!linkTopic && "(skip)"}</span>
          </li>
          <li>
            <BsArrowRight />
          </li>
        </>
        <li className="flex items-center space-x-2">
          {getIconForMutation(linkTagToActionMut)}
          <span>
            Tag Linking {actionTagAssigned.length === 0 ? "(skip)" : ""}
          </span>
        </li>
        <li>
          <BsArrowRight />
        </li>
        <li className="flex items-center space-x-2">
          {getIconForMutation(linkUserToActionMut)}
          <span>
            User Linking {actionUserAssigned.length === 0 ? "(skip)" : ""}
          </span>
        </li>
      </ol>

      {createActionMutation.isError && (
        <div className="flex items-center space-x-2 text-sm font-bold text-red-500">
          <div>
            <BsTriangle />
          </div>
          <div>{extractErrorMessage(createActionMutation.error)}</div>
        </div>
      )}

      <div className="flex flex-row justify-between space-x-4">
        <Button style="neutral" onClick={onClose}>
          Close
        </Button>
        <Button
          style="secondary"
          isLoading={
            createActionMutation.isLoading ||
            linkTopicToActionMut.isLoading ||
            linkTagToActionMut.isLoading ||
            linkUserToActionMut.isLoading
          }
          onClick={() =>
            createActionMutation.mutate({
              title: actionTitle,
              description: actionDescription,
              due_date: actionDueDate,
              priority_id: actionPriorityID,
            })
          }
        >
          Create
        </Button>
      </div>
    </ModalContainer>
  )
}
