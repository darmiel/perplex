import { ReactNode, useMemo } from "react"

import { extractErrorMessage } from "@/api/util"
import { useAuth } from "@/contexts/AuthContext"

import "reactjs-popup/dist/index.css"

import {
  Accordion,
  AccordionItem,
  Button,
  Checkbox,
  Chip,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Progress,
  ScrollShadow,
  Tooltip,
} from "@nextui-org/react"
import clsx from "clsx"
import Link from "next/link"
import {
  BsArrowDown,
  BsArrowUp,
  BsBorderStyle,
  BsCalendar2,
  BsChat,
  BsCheck,
  BsPen,
  BsPeople,
  BsSearch,
  BsTag,
  BsTriangle,
} from "react-icons/bs"
import { toast } from "sonner"

import { Topic } from "@/api/types"
import { useToggleButton } from "@/components/navbar/ExtendedNavbar"
import TopicTagChip from "@/components/topic/TopicTagChip"
import Flex from "@/components/ui/layout/Flex"
import useSearch from "@/components/ui/SearchBar"
import FetchUserTag from "@/components/user/FetchUserTag"
import { useLocalState } from "@/hooks/localStorage"

function TopicListItem({
  topic,
  projectID,
  selected = false,
  beforeBeforeTopicID,
  beforeTopicID,
  afterAfterTopicID,
  afterTopicID,
}: {
  topic: Topic
  projectID: number
  selected?: boolean
  beforeBeforeTopicID?: number
  beforeTopicID?: number
  afterTopicID?: number
  afterAfterTopicID?: number
}) {
  const { user, topics } = useAuth()
  const toggleTopicMutation = topics!.useStatus(
    projectID,
    topic.meeting_id,
    () => {},
  )

  const updateOrderMutation = topics!.useUpdateOrder(
    projectID,
    topic.meeting_id,
    () => toast.success("Topic order updated"),
  )

  const isAssignedToUser = topic.assigned_users.some((u) => u.id === user?.uid)
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
        <Flex justify="between">
          <Flex className="overflow-hidden">
            <Checkbox
              isIndeterminate={toggleTopicMutation.isLoading}
              color={toggleTopicMutation.isLoading ? "warning" : "default"}
              isSelected={topic.closed_at.Valid}
              onValueChange={(checked) => {
                toggleTopicMutation.mutate({
                  topicID: topic.ID,
                  close: checked,
                })
              }}
              lineThrough={topic.closed_at.Valid}
            />
            <h2 className={clsx("truncate text-neutral-200", {})}>
              {topic.title}
            </h2>
          </Flex>
          <Flex>
            <Button
              isIconOnly
              startContent={<BsArrowUp />}
              size="sm"
              variant="light"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                updateOrderMutation.mutate({
                  topicID: topic.ID,
                  before: afterTopicID || -1,
                  after: afterAfterTopicID || -1,
                })
              }}
              isDisabled={
                afterAfterTopicID === undefined && afterTopicID === undefined
              }
            />
            <Button
              isIconOnly
              startContent={<BsArrowDown />}
              size="sm"
              variant="light"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                updateOrderMutation.mutate({
                  topicID: topic.ID,
                  before: beforeBeforeTopicID || -1,
                  after: beforeTopicID || -1,
                })
              }}
              isDisabled={
                beforeTopicID === undefined && beforeBeforeTopicID === undefined
              }
            />
          </Flex>
        </Flex>
        {topic.tags?.length > 0 && (
          <ScrollShadow orientation="horizontal" hideScrollBar className="mt-1">
            <Flex gap={1}>
              {topic.tags.map((tag) => (
                <TopicTagChip key={tag.ID} tag={tag} />
              ))}
            </Flex>
          </ScrollShadow>
        )}
      </div>
    </Flex>
  )
}

type OrderTarget = "lexorank" | "name" | "creation"
type OrderDirection = "asc" | "desc"
type GroupBy = "status" | "tags" | "solution" | "author" | "assigned" | "none"

type OrderMeta = {
  icon: JSX.Element
  name: string
}

type GroupedTopics = {
  title: ReactNode | string
  key: string
  topics: Topic[]
}

/**
 * The order targets
 */
const orders: Record<OrderTarget, OrderMeta> = {
  lexorank: {
    icon: <BsBorderStyle />,
    name: "Lexorank",
  },
  name: {
    icon: <BsTag />,
    name: "Name",
  },
  creation: {
    icon: <BsCalendar2 />,
    name: "Creation",
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
  solution: {
    icon: <BsChat />,
    name: "Solution",
  },
  author: {
    icon: <BsPen />,
    name: "Author",
  },
  assigned: {
    icon: <BsPeople />,
    name: "Assigned",
  },
} as const

/**
 * Sorts the topics by the given target and direction
 * @param topics The topics to sort
 * @param target The order "mode" (e. g. by name)
 * @param direction The direction to sort by
 * @returns The sorted topics
 */
function sortTopics(
  topics: Topic[],
  target: OrderTarget,
  direction: OrderDirection,
): Topic[] {
  return topics.sort((a, b) => {
    let targetA: string, targetB: string
    switch (target) {
      case "creation":
        // comapare by date
        return direction === "asc"
          ? new Date(a.CreatedAt).getTime() - new Date(b.CreatedAt).getTime()
          : new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime()
      case "name":
        targetA = a.title
        targetB = b.title
        break
      case "lexorank":
        targetA = a.lexo_rank || ""
        targetB = b.lexo_rank || ""
        break
    }
    return direction === "asc"
      ? targetA.localeCompare(targetB)
      : targetB.localeCompare(targetA)
  })
}

/**
 * Groups the topics by the given groupBy
 * @param topics The topics to group
 * @param groupBy The groupBy "mode" (e. g. by status)
 * @returns The grouped topics
 */
function groupTopics(topics: Topic[], groupBy: GroupBy): GroupedTopics[] {
  const groupTopics: GroupedTopics[] = []
  switch (groupBy) {
    // show all topics
    case "none":
      groupTopics.push({
        title: "All Topics",
        key: "all-topics",
        topics,
      })
      break
    // group by status (open, closed)
    case "status":
      groupTopics.push(
        {
          title: "Open Topics",
          key: "open-topics",
          topics: topics.filter((topic) => !topic.closed_at.Valid),
        },
        {
          title: "Closed Topics",
          key: "closed-topics",
          topics: topics.filter((topic) => topic.closed_at.Valid),
        },
      )
      break
    // group by solution required
    case "solution":
      groupTopics.push(
        {
          title: "Solution Required",
          key: "solution-required-topics",
          topics: topics.filter((topic) => topic.force_solution),
        },
        {
          title: "No Solution Required",
          key: "no-solution-required-topics",
          topics: topics.filter((topic) => !topic.force_solution),
        },
      )
      break
    // group by tags
    case "tags":
      const tags = new Map<number, Topic[]>()
      topics.forEach((topic) => {
        topic.tags.forEach((tag) => {
          if (!tags.has(tag.ID)) {
            tags.set(tag.ID, [])
          }
          tags.get(tag.ID)!.push(topic)
        })
      })
      tags.forEach((topics, tagID) => {
        const tag = topics
          .find((t) => t.tags.some((tag) => tag.ID === tagID))
          ?.tags.find((tag) => tag.ID === tagID)

        groupTopics.push({
          title: <TopicTagChip tag={tag!} />,
          key: `tag-${tagID}-topics`,
          topics,
        })
      })
      groupTopics.push({
        title: <span className="italic">No Tags</span>,
        key: "no-tags-topics",
        topics: topics.filter((topic) => topic.tags.length === 0),
      })
      break
    // group by creator
    case "author":
      const authors = new Map<string, Topic[]>()
      topics.forEach((topic) => {
        if (!authors.has(topic.creator_id)) {
          authors.set(topic.creator_id, [])
        }
        authors.get(topic.creator_id)!.push(topic)
      })
      authors.forEach((topics, authorID) => {
        groupTopics.push({
          title: <FetchUserTag userID={authorID} />,
          key: `author-${authorID}-topics`,
          topics,
        })
      })
      break
    // group by users assigned
    case "assigned":
      const assigned = new Map<string, Topic[]>()
      topics.forEach((topic) => {
        topic.assigned_users.forEach((user) => {
          if (!assigned.has(user.id)) {
            assigned.set(user.id, [])
          }
          assigned.get(user.id)!.push(topic)
        })
      })
      assigned.forEach((topics, userID) => {
        groupTopics.push({
          title: <FetchUserTag userID={userID} />,
          key: `assigned-${userID}-topics`,
          topics,
        })
      })
      groupTopics.push({
        title: <span className="italic">Unassigned</span>,
        key: "unassigned-topics",
        topics: topics.filter((topic) => topic.assigned_users.length === 0),
      })
      break
  }
  return groupTopics
}

function TopicListItemSection({
  projectID,
  topics,
  selectedTopicID,
}: {
  projectID: number
  topics: Topic[]
  selectedTopicID?: number
}) {
  return topics.map((topic, index) => {
    const beforeBefore = topics.length > index + 2 ? topics[index + 2] : null
    const before = topics.length > index + 1 ? topics[index + 1] : null
    const after = index > 0 ? topics[index - 1] : null
    const afterAfter = index > 1 ? topics[index - 2] : null
    return (
      <div key={topic.ID}>
        <Link
          href={`/project/${projectID}/meeting/${topic.meeting_id}/topic/${topic.ID}`}
        >
          <TopicListItem
            projectID={projectID}
            topic={topic}
            selected={selectedTopicID === topic.ID}
            beforeTopicID={before?.ID}
            beforeBeforeTopicID={beforeBefore?.ID}
            afterTopicID={after?.ID}
            afterAfterTopicID={afterAfter?.ID}
          />
        </Link>
      </div>
    )
  })
}

export function TopicListNG({
  projectID,
  meetingID,
  selectedTopicID,
}: {
  projectID: number
  meetingID: number
  selectedTopicID?: number
}) {
  // load the order by target from local storage
  const [orderByTarget, setOrderByTarget] = useLocalState<OrderTarget>(
    "topic-list-order-by",
    "lexorank",
    (val) => val as OrderTarget,
    (val) => val,
  )

  // load the order direction from local storage
  const [orderDirection, setOrderDirection] = useLocalState<OrderDirection>(
    "topic-list-order-direction",
    "asc",
    (val) => val as OrderDirection,
    (val) => val,
  )

  // load the group by target from local storage
  const [groupBy, setGroupBy] = useLocalState<GroupBy>(
    "topic-list-group-by",
    "status",
    (val) => val as GroupBy,
    (val) => val,
  )

  // search button
  const { component: SearchButton, isToggled: showSearchBar } = useToggleButton(
    "Search Topic",
    <BsSearch />,
    false,
  )
  const { component: SearchBar, filter: searchFilter } = useSearch<Topic>(
    (topic) => topic.title,
  )

  const { topics } = useAuth()

  const { data, error, isError, isSuccess, isLoading } = topics!.useList(
    projectID,
    meetingID,
  )

  // groupedTopics contains the topics sorted and grouped by the selected groupBy
  const groupedTopics = useMemo(() => {
    if (!isSuccess) {
      return []
    }
    const topicsSorted = sortTopics(
      data.data.filter(searchFilter),
      orderByTarget,
      orderDirection,
    )
    return groupTopics(topicsSorted, groupBy)
  }, [groupBy, orderDirection, orderByTarget, data, isSuccess, searchFilter])

  // checkedTopicCount contains the number of topics that are closed
  const checkedTopicCount = useMemo(() => {
    if (!isSuccess) {
      return 0
    }
    return data.data.filter((topic) => topic.closed_at.Valid).length
  }, [data, isSuccess])

  // check if the current topic query is loading
  if (isLoading) {
    return <div>Loading...</div>
  }

  // check if the current topic query has an error
  if (isError) {
    return (
      <div>
        Error: <pre>{extractErrorMessage(error)}</pre>
      </div>
    )
  }

  return (
    <ul className="flex h-full flex-grow flex-col overflow-y-auto">
      <Flex justify="between" className="mt-2 px-3">
        <Flex>
          <span className="rounded-md border border-neutral-500 px-2 py-1 text-xs text-neutral-500">
            TOPICS
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

          <Divider orientation="vertical" />
        </Flex>

        {SearchButton}
      </Flex>

      <Progress
        maxValue={data.data.length}
        value={checkedTopicCount}
        size="sm"
        color={data.data.length === checkedTopicCount ? "success" : "primary"}
        className="my-2 mb-3"
        radius="none"
      />

      {showSearchBar && <div className="mb-2 px-2">{SearchBar}</div>}

      <ScrollShadow hideScrollBar className="h-fit max-h-full">
        <Accordion
          selectionMode="multiple"
          isCompact
          defaultSelectedKeys="all"
          showDivider={false}
          key={groupBy}
        >
          {groupedTopics
            .filter((group) => group.topics.length)
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
                      {group.topics.length}
                    </Chip>
                  </Flex>
                }
              >
                <div className="gap-4 space-y-1">
                  <TopicListItemSection
                    projectID={projectID}
                    topics={group.topics}
                    selectedTopicID={selectedTopicID}
                  />
                </div>
              </AccordionItem>
            ))}
        </Accordion>
      </ScrollShadow>

      {/* Show a message if there are no meetings */}
      {groupedTopics.reduce((acc, group) => acc + group.topics.length, 0) ===
        0 && (
        <div className="flex h-full flex-col items-center justify-center">
          <h2 className="text-lg font-semibold text-neutral-200">No Topics</h2>
          <p className="text-xs text-neutral-500">
            Create a new topic to get started
          </p>
        </div>
      )}
    </ul>
  )
}
