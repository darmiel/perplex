import {
  Avatar,
  AvatarGroup,
  Button,
  Checkbox,
  Input,
  Textarea,
} from "@nextui-org/react"
import { useState } from "react"
import {
  BsCheck2Circle,
  BsCursorText,
  BsTextLeft,
  BsTriangle,
} from "react-icons/bs"
import { GoDiscussionClosed } from "react-icons/go"
import { toast } from "sonner"

import { User } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import PriorityPicker from "@/components/project/priority/PriorityPicker"
import Hr from "@/components/ui/Hr"
import Flex from "@/components/ui/layout/Flex"
import GlowingModalCard from "@/components/ui/modal/GlowingModalCard"
import TooltipAssignUsers from "@/components/ui/overview/common/TooltipAssignUsers"
import { useAuth } from "@/contexts/AuthContext"
import { getUserAvatarURL } from "@/util/avatar"

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
    <GlowingModalCard
      onClick={() => onClick?.()}
      classNames={{
        content: selected ? "space-y-4 bg-white text-black p-4" : undefined,
      }}
    >
      <div className="flex flex-row items-center space-x-3">
        <div className={selected ? "text-black" : "text-neutral-500"}>
          {icon}
        </div>
        <div>
          <h2 className="font-bold">{title}</h2>
          <span className="text-sm text-neutral-500">{subtitle}</span>
        </div>
      </div>
    </GlowingModalCard>
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

export default function CreateTopicModal({
  projectID,
  meetingID,
  onClose,
}: {
  projectID: number
  meetingID: number
  onClose: (newTopicID?: number) => void
}) {
  const [topicTitle, setTopicTitle] = useState<string>("")
  const [topicDescription, setTopicDescription] = useState<string>("")
  const [topicType, setTopicType] = useState<TopicType>("acknowledge")
  const [topicPriorityID, setTopicPriorityID] = useState(0)
  const [topicAssignedNew, setTopicAssignedNew] = useState<User[]>([])

  const [createAnother, setCreateAnother] = useState(false)

  const { topics: topic, projects: project } = useAuth()

  const assignMutation = topic!.useLinkUser(projectID, meetingID, () => {})

  const createTopicMutation = topic!.useCreate(
    projectID,
    meetingID,
    ({ data }, { __should_close }) => {
      for (const user of topicAssignedNew) {
        assignMutation.mutate({
          link: true,
          userID: user.id,
          topicID: data.ID,
        })
      }

      toast.success(`Topic #${data.ID} Created`, { description: data.title })

      // clear form
      setTopicTitle("")
      setTopicDescription("")

      __should_close && onClose?.(data.ID)
    },
  )

  // users in project
  const projectInfoQuery = project!.useUserList(projectID)

  function addUser(user: User) {
    setTopicAssignedNew((old) => [...old, user])
  }

  function removeUser(user: User) {
    setTopicAssignedNew((old) => old.filter((u) => u.id !== user.id))
  }

  function create(shouldClose: boolean) {
    if (createTopicMutation.isLoading) {
      return
    }
    createTopicMutation.mutate({
      title: topicTitle,
      description: topicDescription,
      force_solution: topicType === "discuss",
      priority_id: topicPriorityID,
      __should_close: shouldClose,
    })
  }

  return (
    <GlowingModalCard>
      <Flex x={2}>
        <Input
          type="text"
          startContent={<BsCursorText />}
          labelPlacement="outside"
          isClearable
          value={topicTitle}
          onValueChange={setTopicTitle}
          placeholder="My awesome Topic"
          onKeyDown={(e) => e.key === "Enter" && create(false)}
          autoComplete="off"
        />
        <PriorityPicker
          className="w-[15rem]"
          projectID={projectID}
          setPriorityID={setTopicPriorityID}
        />
      </Flex>

      <Textarea
        minRows={2}
        maxRows={10}
        startContent={<BsTextLeft />}
        labelPlacement="outside"
        placeholder="This is a description"
        value={topicDescription}
        onChange={(event) => setTopicDescription(event.target.value)}
        description="Markdown is supported"
      />

      <Flex x={4}>
        <AckTopicTypeCard
          selected={topicType === "acknowledge"}
          onClick={() => setTopicType("acknowledge")}
        />
        <DiscussTopicTypeCard
          selected={topicType === "discuss"}
          onClick={() => setTopicType("discuss")}
        />
      </Flex>

      {/* Assign Users */}
      <Flex x={2} className="rounded-md bg-neutral-900 p-3">
        <TooltipAssignUsers
          projectID={projectID}
          onAssign={addUser}
          onUnassign={removeUser}
          users={topicAssignedNew}
          showCheckmark
        />
        {topicAssignedNew.length <= 0 ? (
          <span className="text-neutral-400">No users assigned</span>
        ) : (
          <span className="text-neutral-400">
            <span className="text-white">{topicAssignedNew.length}</span> users
            assigned
          </span>
        )}
        <AvatarGroup max={8}>
          {topicAssignedNew.map((user, key) => (
            <Avatar
              key={key}
              src={getUserAvatarURL(user.id)}
              name={user.name}
              size="sm"
            />
          ))}
        </AvatarGroup>
      </Flex>

      <Hr />

      {createTopicMutation.isError && (
        <div className="flex items-center space-x-2 text-sm font-bold text-red-500">
          <div>
            <BsTriangle />
          </div>
          <div>{extractErrorMessage(createTopicMutation.error)}</div>
        </div>
      )}
      <div className="flex w-full flex-col items-center justify-between space-x-2 space-y-2 md:flex-row md:space-y-0">
        <span className="rounded-md bg-neutral-900 px-2 py-1">
          Create New Topic
        </span>
        <div className="flex items-center space-x-2">
          <Checkbox isSelected={createAnother} onValueChange={setCreateAnother}>
            Create Another
          </Checkbox>
          <Button variant="bordered" onClick={() => onClose()}>
            Cancel
          </Button>
          <Button
            className="bg-white text-black"
            isLoading={createTopicMutation.isLoading}
            onClick={() => create(!createAnother)}
          >
            Create
          </Button>
        </div>
      </div>
    </GlowingModalCard>
  )
}
