import { Select, SelectItem } from "@nextui-org/react"

import { Priority } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import Flex from "@/components/ui/layout/Flex"
import { useAuth } from "@/contexts/AuthContext"

function PrioritySelectItemContents({ priority }: { priority: Priority }) {
  return (
    <Flex justify="between">
      <span>{priority.title}</span>
      {priority.color && (
        <div
          className="h-3 w-3 rounded-full"
          style={{
            backgroundColor: priority.color,
          }}
        ></div>
      )}
    </Flex>
  )
}

export default function PriorityPicker({
  projectID,
  defaultValue,
  setPriorityID,
  className = "",
}: {
  projectID: number
  defaultValue?: number
  setPriorityID: (priorityID: number) => void
  className?: string
}) {
  const { priorities } = useAuth()
  const projectPrioritiesQuery = priorities!.useList(projectID)
  if (projectPrioritiesQuery.isLoading) {
    return <div>Loading...</div>
  }
  if (projectPrioritiesQuery.isError) {
    return <div>Error: {extractErrorMessage(projectPrioritiesQuery.error)}</div>
  }
  return (
    <Select
      items={projectPrioritiesQuery.data.data}
      labelPlacement="outside"
      placeholder="Select a priority"
      className={className}
      renderValue={(items) =>
        items.length === 0 ? (
          <>No Priority</>
        ) : (
          items.map(
            (item) =>
              item.data && (
                <PrioritySelectItemContents
                  key={item.data.ID}
                  priority={item.data}
                />
              ),
          )
        )
      }
      defaultSelectedKeys={[String(defaultValue)]}
      onSelectionChange={(item) => {
        if (item !== "all" && item.size > 0) {
          item.forEach((item) => setPriorityID(Number(item)))
        } else {
          setPriorityID(0)
        }
      }}
    >
      {(priority) => (
        <SelectItem
          variant="faded"
          key={String(priority.ID)}
          value={priority.ID}
        >
          <PrioritySelectItemContents priority={priority} />
        </SelectItem>
      )}
    </Select>
    /*
    <select
      onChange={(e) => setPriorityID(Number(e.target.value))}
    >
      <option value="0">No Priority</option>
      {projectPrioritiesQuery.data?.data.map((priority) => (
        <option key={priority.ID} value={priority.ID}>
          {priority.title}
        </option>
      ))}
    </select>
    */
  )
}
