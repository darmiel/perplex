import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react"
import clsx from "clsx"
import { BsChevronDown } from "react-icons/bs"

import { useAuth } from "@/contexts/AuthContext"

export default function TopicSelectBreadcrumbs({
  projectID,
  meetingID,
  topicID,
  topicName,
}: {
  projectID: number
  meetingID: number
  topicID: number
  topicName: string
}) {
  const { topics } = useAuth()
  const topicListQuery = topics!.useList(projectID, meetingID)

  return (
    <>
      {topicName}
      {!!topicListQuery.data?.data?.length && (
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
              aria-label="Routes-Topics"
              disabledKeys={[projectID]}
              className="max-h-64 overflow-y-scroll"
            >
              {topicListQuery.data.data.map((t) => (
                <DropdownItem
                  key={t.ID}
                  href={`/project/${projectID}/meeting/${meetingID}/topic/${t.ID}`}
                  onClick={(event) => event.preventDefault()}
                  className={clsx({
                    "text-neutral-400": topicID === t.ID,
                  })}
                >
                  {t.title}
                </DropdownItem>
              )) || <></>}
            </DropdownMenu>
          </Dropdown>
        </>
      )}
    </>
  )
}
