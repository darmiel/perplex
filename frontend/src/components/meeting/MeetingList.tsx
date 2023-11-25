import { ReactNode, useMemo } from "react"

import { extractErrorMessage } from "@/api/util"
import { useAuth } from "@/contexts/AuthContext"

import "reactjs-popup/dist/index.css"

import {
  Accordion,
  AccordionItem,
  Button,
  Chip,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  ScrollShadow,
  Tooltip,
} from "@nextui-org/react"
import clsx from "clsx"
import Link from "next/link"
import {
  BsArrowDown,
  BsArrowUp,
  BsCalendar,
  BsCalendar2,
  BsCheck,
  BsSearch,
  BsTag,
  BsTriangle,
} from "react-icons/bs"

import { Meeting } from "@/api/types"
import MeetingChip from "@/components/meeting/chips/MeetingChips"
import { getMeetingTenseByMeeting } from "@/components/meeting/MeetingTag"
import { useToggleButton } from "@/components/navbar/ExtendedNavbar"
import TopicTagChip from "@/components/topic/TopicTagChip"
import Flex from "@/components/ui/layout/Flex"
import useSearch from "@/components/ui/SearchBar"
import { useLocalState } from "@/hooks/localStorage"

function MeetingListItem({
  meeting,
  selected = false,
}: {
  meeting: Meeting
  selected?: boolean
}) {
  const { user } = useAuth()

  const isAssignedToUser =
    meeting.assigned_users &&
    meeting.assigned_users.some((u) => u.id === user?.uid)

  return (
    <Flex
      col
      className={clsx(
        "rounded-md border border-transparent p-2 transition duration-150 ease-in-out",
        "hover:border-neutral-800 hover:bg-neutral-900",
        {
          "border-l-3 border-l-primary-500": isAssignedToUser,
          "bg-neutral-800": selected,
        },
      )}
    >
      <div className="ml-1">
        <Flex x={2} className="overflow-hidden">
          <MeetingChip meeting={meeting} />
          <h2 className={clsx("truncate text-neutral-200", {})}>
            {meeting.name}
          </h2>
        </Flex>
      </div>
    </Flex>
  )
}

type OrderTarget = "name" | "creation" | "upcoming"
type OrderDirection = "asc" | "desc"
type GroupBy = "status" | "tags" | "none"

type OrderMeta = {
  icon: JSX.Element
  name: string
}

type GroupedMeetings = {
  title: ReactNode | string
  key: string
  meetings: Meeting[]
}

/**
 * The order targets
 */
const orders: Record<OrderTarget, OrderMeta> = {
  name: {
    icon: <BsTag />,
    name: "Name",
  },
  creation: {
    icon: <BsCalendar2 />,
    name: "Creation",
  },
  upcoming: {
    icon: <BsCalendar />,
    name: "Upcoming",
  },
} as const

/**
 * The group by targets
 */
const groups: Record<GroupBy, OrderMeta> = {
  none: {
    icon: <BsTriangle />,
    name: "None",
  },
  status: {
    icon: <BsCheck />,
    name: "Status",
  },
  tags: {
    icon: <BsTag />,
    name: "Tags",
  },
} as const

/**
 * Sorts the meetings by the given target and direction
 * @param meetings The meetings to sort
 * @param target The order "mode" (e. g. by name)
 * @param direction The direction to sort by
 * @returns The sorted meetings
 */
function sortMeetings(
  meetings: Meeting[],
  target: OrderTarget,
  direction: OrderDirection,
): Meeting[] {
  return meetings.sort((a, b) => {
    let targetA: string, targetB: string
    switch (target) {
      case "creation":
        // comapare by date
        return direction === "asc"
          ? new Date(a.CreatedAt).getTime() - new Date(b.CreatedAt).getTime()
          : new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime()
      case "upcoming":
        return direction === "asc"
          ? new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
          : new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      case "name":
        targetA = a.name
        targetB = b.name
        break
    }
    return direction === "asc"
      ? targetA.localeCompare(targetB)
      : targetB.localeCompare(targetA)
  })
}

/**
 * Groups the meetings by the given groupBy
 * @param meetings The meetings to group
 * @param groupBy The groupBy "mode" (e. g. by status)
 * @returns The grouped meetings
 */
function groupMeetings(
  meetings: Meeting[],
  groupBy: GroupBy,
): GroupedMeetings[] {
  const groupMeetings: GroupedMeetings[] = []
  switch (groupBy) {
    // show all meetings
    case "none":
      groupMeetings.push({
        title: "All Meetings",
        key: "all-meetings",
        meetings,
      })
      break
    // group by status (open, closed)
    case "status":
      groupMeetings.push(
        {
          title: "Ongoing Meetings",
          key: "ongoing-meetings",
          meetings: meetings.filter(
            (meeting) => getMeetingTenseByMeeting(meeting) === "ongoing",
          ),
        },
        {
          title: "Upcoming Meetings",
          key: "upcoming-meetings",
          meetings: meetings.filter(
            (meeting) => getMeetingTenseByMeeting(meeting) === "future",
          ),
        },
        {
          title: "Past Meetings",
          key: "past-meetings",
          meetings: meetings.filter(
            (meeting) => getMeetingTenseByMeeting(meeting) === "past",
          ),
        },
      )
      break
    // group by tags
    case "tags":
      const tags = new Map<number, Meeting[]>()
      meetings.forEach((meeting) => {
        meeting.tags.forEach((tag) => {
          if (!tags.has(tag.ID)) {
            tags.set(tag.ID, [])
          }
          tags.get(tag.ID)!.push(meeting)
        })
      })
      tags.forEach((meetings, tagID) => {
        const tag = meetings
          .find((t) => t.tags.some((tag) => tag.ID === tagID))
          ?.tags.find((tag) => tag.ID === tagID)

        groupMeetings.push({
          title: <TopicTagChip tag={tag!} />,
          key: `tag-${tagID}-meetings`,
          meetings,
        })
      })
      groupMeetings.push({
        title: <span className="italic">No Tags</span>,
        key: "no-tags-meetings",
        meetings: meetings.filter((meeting) => meeting.tags.length === 0),
      })
      break
  }
  return groupMeetings
}

export function MeetingListNG({
  projectID,
  selectedMeetingID,
}: {
  projectID: number
  selectedMeetingID?: number
}) {
  // load the order by target from local storage
  const [orderByTarget, setOrderByTarget] = useLocalState<OrderTarget>(
    "meeting-list-order-by",
    "upcoming",
    (val) => val as OrderTarget,
    (val) => val,
  )

  // load the order direction from local storage
  const [orderDirection, setOrderDirection] = useLocalState<OrderDirection>(
    "meeting-list-order-direction",
    "asc",
    (val) => val as OrderDirection,
    (val) => val,
  )

  // load the group by target from local storage
  const [groupBy, setGroupBy] = useLocalState<GroupBy>(
    "meeting-list-group-by",
    "status",
    (val) => val as GroupBy,
    (val) => val,
  )

  // search button
  const { component: SearchButton, isToggled: showSearchBar } = useToggleButton(
    "Search Meetings",
    <BsSearch />,
    false,
  )
  const { component: SearchBar, filter: searchFilter } = useSearch<Meeting>(
    (meeting) => meeting.name,
  )

  const { meetings } = useAuth()

  const { data, error, isError, isSuccess, isLoading } =
    meetings!.useList(projectID)

  // groupedMeetings contains the meetings sorted and grouped by the selected groupBy
  const groupedMeetings = useMemo(() => {
    if (!isSuccess) {
      return []
    }
    const meetingsSorted = sortMeetings(
      data.data.filter(searchFilter),
      orderByTarget,
      orderDirection,
    )
    return groupMeetings(meetingsSorted, groupBy)
  }, [groupBy, orderDirection, orderByTarget, data, isSuccess, searchFilter])

  // check if the current meeting query is loading
  if (isLoading) {
    return <div>Loading...</div>
  }

  // check if the current meeting query has an error
  if (isError) {
    return (
      <div>
        Error: <pre>{extractErrorMessage(error)}</pre>
      </div>
    )
  }

  return (
    <ul className="flex h-full flex-grow flex-col overflow-y-auto">
      <Flex justify="between" className="my-2 px-3">
        <Flex>
          <span className="rounded-md border border-neutral-500 px-2 py-1 text-xs text-neutral-500">
            MEETINGS
          </span>

          {/* Sort */}
          <Dropdown>
            <Tooltip content="Order By">
              <div className="max-w-fit">
                <DropdownTrigger>
                  <Button
                    isIconOnly
                    startContent={orders[orderByTarget].icon}
                    size="sm"
                    variant="light"
                  />
                </DropdownTrigger>
              </div>
            </Tooltip>
            <DropdownMenu
              items={Object.values(orders)}
              selectionMode="single"
              onSelectionChange={(sel) => {
                sel !== "all" &&
                  sel.forEach((val) => {
                    setOrderByTarget(
                      val.toString().toLowerCase() as OrderTarget,
                    )
                  })
              }}
            >
              {(item) => (
                <DropdownItem
                  key={(item as OrderMeta).name}
                  startContent={(item as OrderMeta).icon}
                >
                  {(item as OrderMeta).name}
                </DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>

          {/* Direction */}
          <Tooltip content="Order Direction">
            <Button
              isIconOnly
              variant="light"
              startContent={
                orderDirection === "asc" ? <BsArrowDown /> : <BsArrowUp />
              }
              onClick={() =>
                setOrderDirection((prev) => (prev === "asc" ? "desc" : "asc"))
              }
              size="sm"
            />
          </Tooltip>

          <Divider orientation="vertical" />

          <Dropdown>
            <Tooltip content="Group By">
              <div className="max-w-fit">
                <DropdownTrigger>
                  <Button
                    isIconOnly
                    startContent={groups[groupBy].icon}
                    size="sm"
                    variant="light"
                  />
                </DropdownTrigger>
              </div>
            </Tooltip>
            <DropdownMenu
              items={Object.values(groups)}
              selectionMode="single"
              onSelectionChange={(sel) => {
                sel !== "all" &&
                  sel.forEach((val) => {
                    setGroupBy(val.toString().toLowerCase() as GroupBy)
                  })
              }}
            >
              {(item) => (
                <DropdownItem
                  key={(item as OrderMeta).name}
                  startContent={(item as OrderMeta).icon}
                >
                  {(item as OrderMeta).name}
                </DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>
        </Flex>

        {SearchButton}
      </Flex>

      {showSearchBar && <div className="my-2 px-2">{SearchBar}</div>}

      <ScrollShadow hideScrollBar className="h-full">
        <Accordion
          selectionMode="multiple"
          isCompact
          defaultSelectedKeys="all"
          showDivider={false}
          key={groupBy}
        >
          {groupedMeetings
            .filter((group) => group.meetings.length)
            .map((group) => (
              <AccordionItem
                key={group.key}
                classNames={{
                  heading: "rounded-md bg-neutral-900 px-2 mt-1",
                  content: "mb-4",
                }}
                title={
                  <Flex x={2} justify="between" className="">
                    <span className="text-sm">{group.title}</span>
                    <Chip variant="solid" size="sm">
                      {group.meetings.length}
                    </Chip>
                  </Flex>
                }
              >
                <div className="gap-4 space-y-1">
                  {group.meetings.map((meeting) => (
                    <Link
                      key={meeting.ID}
                      href={`/project/${projectID}/meeting/${meeting.ID}`}
                    >
                      <MeetingListItem
                        meeting={meeting}
                        selected={selectedMeetingID === meeting.ID}
                      />
                    </Link>
                  ))}
                </div>
              </AccordionItem>
            ))}
        </Accordion>

        {/* Show a message if there are no meetings */}
        {groupedMeetings.reduce(
          (acc, group) => acc + group.meetings.length,
          0,
        ) === 0 && (
          <div className="flex h-full flex-col items-center justify-center">
            <h2 className="text-lg font-semibold text-neutral-200">
              No Meetings
            </h2>
            <p className="text-xs text-neutral-500">
              Create a new meeting to get started
            </p>
          </div>
        )}
      </ScrollShadow>
    </ul>
  )
}
