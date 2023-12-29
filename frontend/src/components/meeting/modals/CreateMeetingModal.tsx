import {
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Chip,
  Divider,
  Input,
  Select,
  SelectedItems,
  Selection,
  SelectItem,
  Textarea,
} from "@nextui-org/react"
import { add } from "date-fns"
import { useRouter } from "next/router"
import { useState } from "react"
import {
  BsCalendarPlus,
  BsCursorText,
  BsPeople,
  BsTag,
  BsTextLeft,
} from "react-icons/bs"
import { toast } from "sonner"

import { Tag, User } from "@/api/types"
import ResolveProjectName from "@/components/resolve/ResolveProjectName"
import ResolveUserName from "@/components/resolve/ResolveUserName"
import { StartEndDateTimePicker } from "@/components/ui/calendar/StartEndDateTimePicker"
import GlowingModalCard from "@/components/ui/modal/GlowingModalCard"
import TopicTagChip from "@/components/ui/TagChip"
import { EditOrRenderMarkdown } from "@/components/ui/text/EditOrRenderMarkdown"
import { UserAvatar } from "@/components/user/UserAvatar"
import { useAuth } from "@/contexts/AuthContext"
import { getNextQuarterHour } from "@/util/date"
import { getMeetingURL, getProjectURL } from "@/util/url"

export default function CreateMeetingModal({
  projectID,
  onClose,
}: {
  projectID: number
  onClose: () => void
}) {
  const [createdMeetingID, setCreatedMeetingID] = useState<number | null>(null)

  const [selectedUsers, setSelectedUsers] = useState<Selection>(new Set())
  const [selectedTags, setSelectedTags] = useState<Selection>(new Set())

  const [meetingTitle, setMeetingTitle] = useState<string>("")
  const [meetingDescription, setMeetingDescription] = useState<string>("")

  const router = useRouter()

  // load users for current project
  const { projects, tags, meetings } = useAuth()
  const listUserQuery = projects!.useUserList(projectID)
  const listTagsQuery = tags!.useList(projectID)

  const assignUserMut = meetings!.useLinkUser(projectID, () => {})
  const assignTagMut = meetings!.useLinkTag(projectID, () => {})

  const createMeetingMut = meetings!.useCreate(
    projectID,
    ({ data: meeting }) => {
      toast.success("Meeting created successfully", {
        action: {
          label: "View",
          onClick: () => {
            router.push(getMeetingURL(projectID, meeting.ID))
          },
        },
      })

      // assign users
      Array.from(selectedUsers).forEach((user) => {
        assignUserMut.mutate({
          meetingID: meeting.ID,
          userID: user.toString(),
          link: true,
        })
      })

      // assign tags
      Array.from(selectedTags).forEach((tag) => {
        assignTagMut.mutate({
          meetingID: meeting.ID,
          tagID: Number(tag.toString()),
          link: true,
        })
      })

      setCreatedMeetingID(meeting.ID)
    },
  )

  const defaultStartDate = getNextQuarterHour(new Date())
  const defaultEndDate = getNextQuarterHour(
    add(defaultStartDate, { minutes: 30 }),
  )

  const [startDate, setStartDate] = useState<Date>(defaultStartDate)
  const [endDate, setEndDate] = useState<Date>(defaultEndDate)

  const handleCreateMeeting = () => {
    if (createdMeetingID) {
      onClose?.()
      router.push(getMeetingURL(projectID, createdMeetingID))
      return
    }
    createMeetingMut.mutate({
      __should_close: false,
      title: meetingTitle,
      start_date: startDate,
      end_date: endDate,
      description: meetingDescription,
    })
  }

  const anyLoading =
    createMeetingMut.isLoading ||
    assignTagMut.isLoading ||
    assignUserMut.isLoading

  return (
    <GlowingModalCard>
      {/* Meeting Name */}
      <Input
        type="text"
        labelPlacement="outside"
        placeholder="My awesome Meeting"
        startContent={<BsCursorText />}
        value={meetingTitle}
        onValueChange={setMeetingTitle}
      />

      {/* Meeting Time */}
      <StartEndDateTimePicker
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />

      <Divider />

      {/* Assign Users */}
      <Select
        startContent={<BsPeople />}
        items={listUserQuery.data?.data ?? []}
        isMultiline={true}
        selectionMode="multiple"
        placeholder="Assign to user"
        labelPlacement="outside"
        renderValue={(items: SelectedItems<User>) => {
          return (
            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <Chip
                  key={item.data!.id}
                  // we need to call UserAvatar here because the Chip component
                  // does not work when wrapping the Avatar component
                  avatar={UserAvatar({ userID: item.data!.id })}
                  variant="shadow"
                  color="warning"
                >
                  <ResolveUserName userID={item.data!.id} />
                </Chip>
              ))}
            </div>
          )
        }}
        onSelectionChange={setSelectedUsers}
      >
        {(user) => (
          <SelectItem key={user.id} textValue={user.id}>
            <div className="flex items-center gap-2">
              <UserAvatar userID={user.id} />
              <span className="text-small">
                <ResolveUserName userID={user.id} />
              </span>
            </div>
          </SelectItem>
        )}
      </Select>

      {/* Add Tags */}
      <Select
        startContent={<BsTag />}
        items={listTagsQuery.data?.data ?? []}
        isMultiline={true}
        selectionMode="multiple"
        placeholder="Add a tag"
        labelPlacement="outside"
        renderValue={(items: SelectedItems<Tag>) => {
          return (
            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <TopicTagChip key={item.data!.ID} tag={item.data!} />
              ))}
            </div>
          )
        }}
        onSelectionChange={setSelectedTags}
      >
        {(tag) => (
          <SelectItem key={tag.ID} textValue={tag.title}>
            <TopicTagChip key={tag.ID} tag={tag} />
          </SelectItem>
        )}
      </Select>

      <Divider />

      <EditOrRenderMarkdown
        isEdit={true}
        editValue={meetingDescription}
        setEditValue={setMeetingDescription}
        displayValue={meetingDescription}
        textAreaComponent={
          <Textarea
            label="Description"
            labelPlacement="outside"
            placeholder="This is a description (Markdown is supported)"
            startContent={<BsTextLeft />}
            minRows={6}
            maxRows={15}
            description="Markdown is supported"
            value={meetingDescription}
            onValueChange={setMeetingDescription}
          />
        }
      />

      <Divider />

      {/* Action Buttons */}
      <div className="flex w-full flex-col items-center justify-between space-x-2 space-y-2 md:flex-row md:space-y-0">
        <Breadcrumbs className="rounded-md bg-neutral-900 px-2 py-1">
          <BreadcrumbItem
            href={getProjectURL(projectID)}
            onClick={() => onClose()}
          >
            <ResolveProjectName projectID={projectID} />
          </BreadcrumbItem>
          <BreadcrumbItem startContent={<BsCalendarPlus />}>
            Create
          </BreadcrumbItem>
        </Breadcrumbs>
        <div className="flex items-center space-x-2">
          {anyLoading ||
            (!createdMeetingID && (
              <Button variant="bordered" onClick={onClose}>
                Cancel
              </Button>
            ))}
          <Button
            className="bg-white text-black"
            isLoading={anyLoading}
            onClick={handleCreateMeeting}
          >
            {createdMeetingID ? "View" : "Create"}
          </Button>
        </div>
      </div>
    </GlowingModalCard>
  )
}
