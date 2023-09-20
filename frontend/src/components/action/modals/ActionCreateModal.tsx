import {
  Accordion,
  AccordionItem,
  Avatar,
  AvatarGroup,
  Input,
  ScrollShadow,
  Textarea,
} from "@nextui-org/react"
import { UseMutationResult } from "@tanstack/react-query"
import { useState } from "react"
import ReactDatePicker from "react-datepicker"
import {
  BsArrowRight,
  BsCheckCircleFill,
  BsCircleFill,
  BsTriangle,
  BsX,
  BsXCircleFill,
} from "react-icons/bs"
import { BarLoader, ClipLoader } from "react-spinners"
import { toast } from "sonner"

import { User } from "@/api/types"
import { extractErrorMessage, PickerCustomInput } from "@/api/util"
import PriorityPicker from "@/components/project/priority/PriorityPicker"
import Button from "@/components/ui/Button"
import { CheckableCardContainer } from "@/components/ui/card/CheckableCardContainer"
import Hr from "@/components/ui/Hr"
import Flex from "@/components/ui/layout/Flex"
import TooltipAssignUsers from "@/components/ui/overview/common/TooltipAssignUsers"
import TagList from "@/components/ui/tag/TagList"
import { getUserAvatarURL } from "@/components/user/UserAvatar"
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
  const [actionUserAssigned, setActionUserAssigned] = useState<User[]>([])
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
    for (const user of actionUserAssigned) {
      linkUserToActionMut.mutate({
        link: true,
        actionID: data.ID,
        userID: user.id,
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

  function addUser(user: User) {
    setActionUserAssigned((old) => [...old, user])
  }

  function removeUser(user: User) {
    setActionUserAssigned((old) => old.filter((u) => u !== user))
  }

  function addTag(tagID: number) {
    setActionTagsAssigned((old) => [...old, tagID])
  }

  function removeTag(tagID: number) {
    setActionTagsAssigned((old) => old.filter((t) => t !== tagID))
  }

  return (
    <div
      className={`w-[40rem] space-y-4 rounded-md border border-neutral-800 bg-neutral-950 p-4`}
    >
      <h1 className="text-xl font-semibold">{`Create Action${
        topicID ? ` for Topic ${topicID}` : ""
      }`}</h1>

      <Flex x={2}>
        <Input
          variant="bordered"
          type="text"
          label="Action Title"
          placeholder="My awesome Action"
          onValueChange={setActionTitle}
          value={actionTitle}
          autoComplete="off"
        />
        <PriorityPicker
          className="w-[15rem]"
          projectID={projectID}
          setPriorityID={setActionPriorityID}
        />
      </Flex>

      <Textarea
        minRows={2}
        maxRows={10}
        label="Action Description"
        placeholder="This is a description (Markdown is supported)"
        value={actionDescription}
        onValueChange={setActionDescription}
        variant="bordered"
        description="Markdown is supported"
      />

      {/* Assign Users */}
      <Flex x={2} className="rounded-md bg-neutral-900 p-3">
        <TooltipAssignUsers
          projectID={projectID}
          onAssign={addUser}
          onUnassign={removeUser}
          users={actionUserAssigned}
          showCheckmark
          offset={60}
        />
        {actionUserAssigned.length <= 0 ? (
          <span className="text-neutral-400">No users assigned</span>
        ) : (
          <span className="text-neutral-400">
            <span className="text-white">{actionUserAssigned.length}</span>{" "}
            users assigned
          </span>
        )}
        <AvatarGroup max={8}>
          {actionUserAssigned.map((user, key) => (
            <Avatar
              key={key}
              src={getUserAvatarURL(user.id)}
              name={user.name}
              size="sm"
            />
          ))}
        </AvatarGroup>
      </Flex>

      <Accordion>
        <AccordionItem key="advanced" title="More Options" isCompact>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="whitespace-nowrap text-neutral-400">
                Due Date:
              </span>
              <ReactDatePicker
                selected={actionDueDate ? new Date(actionDueDate) : undefined}
                onChange={(date) => setActionDueDate(date?.toString() || "")}
                timeInputLabel="Time:"
                dateFormat="MM/dd/yyyy h:mm aa"
                customInput={<PickerCustomInput />}
                showTimeInput
              />
              {actionDueDate && (
                <Button
                  noBaseStyle
                  style="animated"
                  onClick={() => setActionDueDate("")}
                >
                  <BsX />
                </Button>
              )}
            </div>

            {/* Assign Tags */}
            <div className="flex items-start space-x-2">
              <span className="whitespace-nowrap text-neutral-400">
                Assign Tags:
              </span>
              <div className="flex max-w-xl flex-row space-x-4">
                {tagsQuery.isLoading ? (
                  <BarLoader color="white" />
                ) : (
                  <ScrollShadow hideScrollBar className="max-h-36">
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
                  </ScrollShadow>
                )}
              </div>
            </div>
          </div>
        </AccordionItem>
      </Accordion>

      <Hr />

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
    </div>
  )
}
