import { useEffect, useState } from "react"
import DatePicker from "react-datepicker"

import "react-datepicker/dist/react-datepicker.css"

import { BsTriangle } from "react-icons/bs"
import { toast } from "sonner"

import { extractErrorMessage, PickerCustomInput } from "@/api/util"
import Button from "@/components/ui/Button"
import Hr from "@/components/ui/Hr"
import Flex from "@/components/ui/layout/Flex"
import ModalContainer from "@/components/ui/modal/ModalContainer"
import { useAuth } from "@/contexts/AuthContext"

export default function CreateMeeting({
  projectID,
  onClose,
}: {
  projectID: number
  onClose: (newMeetingID: number) => void
}) {
  const [meetingTitle, setMeetingTitle] = useState<string>("")
  const [meetingDescription, setMeetingDescription] = useState<string>("")
  const [meetingStartDate, setMeetingStartDate] = useState<Date>(new Date())
  const [meetingEndDate, setMeetingEndDate] = useState<Date>(new Date())

  useEffect(() => {
    // get days since epoch for start and end date
    const startDateDays = Math.floor(meetingStartDate.getTime() / 86400000)
    const endDateDays = Math.floor(meetingEndDate.getTime() / 86400000)
    if (endDateDays < startDateDays) {
      // set meeting end date to start date + 30 mins
      setMeetingEndDate(new Date(meetingStartDate.getTime() + 30 * 60000))
    }
  }, [meetingStartDate, meetingEndDate])

  const { meetings } = useAuth()

  const createMeetingMutation = meetings!.useCreate(
    projectID,
    ({ data }, { __should_close }) => {
      toast.success(`Meeting #${data.ID} Created`)

      // clear form
      setMeetingTitle("")
      setMeetingDescription("")
      setMeetingStartDate(new Date())
      setMeetingEndDate(new Date())

      __should_close && onClose?.(data.ID)
    },
  )

  function create(shouldClose: boolean) {
    if (createMeetingMutation.isLoading) {
      return
    }
    createMeetingMutation.mutate({
      title: meetingTitle,
      description: meetingDescription,
      start_date: meetingStartDate,
      end_date: meetingEndDate,
      __should_close: shouldClose,
    })
  }

  return (
    <ModalContainer title="Create Meeting">
      <div className="space-y-2">
        <label className="text-neutral-400" htmlFor="meetingTitle">
          Meeting Title
        </label>
        <input
          id="meetingTitle"
          type="text"
          className="w-full rounded-lg border border-neutral-600 bg-neutral-800 p-2"
          placeholder="My awesome Meeting"
          onChange={(event) => setMeetingTitle(event.target.value)}
          value={meetingTitle}
          onKeyDown={(e) => e.key === "Enter" && create(false)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-neutral-400" htmlFor="meetingDescription">
          Meeting Description
        </label>
        <textarea
          id="meetingDescription"
          className="w-full rounded-lg border border-neutral-600 bg-neutral-800 p-2"
          placeholder="(Markdown is supported)"
          rows={10}
          onChange={(event) => setMeetingDescription(event.target.value)}
          value={meetingDescription}
        />
      </div>

      <Flex x={4}>
        <div className="w-full space-y-2">
          <label className="text-neutral-400" htmlFor="meetingDateStart">
            Start Date
          </label>
          <div>
            <DatePicker
              selected={meetingStartDate}
              onChange={(date) => date && setMeetingStartDate(date)}
              timeInputLabel="Time:"
              dateFormat="MM/dd/yyyy h:mm aa"
              customInput={<PickerCustomInput />}
              showTimeInput
            />
          </div>
        </div>
        <div className="w-full space-y-2">
          <label className="text-neutral-400" htmlFor="meetingDateEnd">
            End Date
          </label>
          <div>
            <DatePicker
              selected={meetingEndDate}
              onChange={(date) => date && setMeetingEndDate(date)}
              timeInputLabel="Time:"
              dateFormat="MM/dd/yyyy h:mm aa"
              customInput={<PickerCustomInput />}
              showTimeInput
              minDate={meetingStartDate}
            />
          </div>
        </div>
      </Flex>

      <Hr />

      {createMeetingMutation.isError && (
        <div className="flex items-center space-x-2 text-sm font-bold text-red-500">
          <div>
            <BsTriangle />
          </div>
          <div>{extractErrorMessage(createMeetingMutation.error)}</div>
        </div>
      )}
      <div className="flex flex-row justify-end space-x-4">
        <Button
          style="secondary"
          isLoading={createMeetingMutation.isLoading}
          onClick={() => create(true)}
        >
          Save and Close
        </Button>

        <Button
          style="primary"
          isLoading={createMeetingMutation.isLoading}
          onClick={() => create(false)}
        >
          Save and Create New
        </Button>
      </div>
    </ModalContainer>
  )
}
