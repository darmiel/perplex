import { useAuth } from "@/contexts/AuthContext"

export default function PriorityPicker({
  id,
  projectID,
  defaultValue,
  setPriorityID,
}: {
  id?: string
  projectID: number
  defaultValue?: number
  setPriorityID: (priorityID: number) => void
}) {
  const { priorities } = useAuth()
  const projectPrioritiesQuery = priorities!.useList(projectID)
  if (projectPrioritiesQuery.isLoading) {
    return <div>Loading...</div>
  }
  return (
    <select
      id={id}
      className="w-fit rounded-lg border border-neutral-600 bg-neutral-800 bg-transparent p-2"
      defaultValue={defaultValue}
      onChange={(e) => setPriorityID(Number(e.target.value))}
    >
      <option value="0">No Priority</option>
      {projectPrioritiesQuery.data?.data.map((priority) => (
        <option key={priority.ID} value={priority.ID}>
          {priority.title}
        </option>
      ))}
    </select>
  )
}
