import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react"
import clsx from "clsx"
import { ReactNode } from "react"
import { BsChevronDown } from "react-icons/bs"

import MeetingChip from "@/components/meeting/chips/MeetingChips"
import { useAuth } from "@/contexts/AuthContext"

export default function MeetingSelectBreadcrumbs({
  meetingID,
  meetingName,
  projectID,
}: {
  meetingID: number
  meetingName: string | ReactNode
  projectID: number
}) {
  const { meetings } = useAuth()
  const meetingListQuery = meetings!.useList(projectID)

  return (
    <>
      {meetingName}
      {!!meetingListQuery.data?.data?.length && (
        <>
          <Dropdown maxHeight={8}>
            <DropdownTrigger>
              <Button
                isIconOnly
                endContent={<BsChevronDown />}
                size="sm"
                variant="light"
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                }}
              />
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Routes-Meetings"
              disabledKeys={[meetingID]}
              className="max-h-64 overflow-y-scroll"
            >
              {meetingListQuery.data.data.map((m) => (
                <DropdownItem
                  key={m.ID}
                  href={`/project/${projectID}/meeting/${m.ID}`}
                  onClick={(event) => event.preventDefault()}
                  className={clsx({
                    "text-neutral-400": meetingID === m.ID,
                  })}
                >
                  <div className="flex items-center space-x-2">
                    <MeetingChip meeting={m} />
                    <span>{m.name}</span>
                  </div>
                </DropdownItem>
              )) || <></>}
            </DropdownMenu>
          </Dropdown>
        </>
      )}
    </>
  )
}
