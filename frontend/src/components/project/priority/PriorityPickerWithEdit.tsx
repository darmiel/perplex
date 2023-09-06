import { Priority } from "@/api/types"
import PriorityPicker from "@/components/project/priority/PriorityPicker"
import { PriorityTag } from "@/components/ui/tag/Tag"

export default function PriorityPickerWithEdit({
  projectID,
  priorityID,
  priority,
  setEditPriorityID,
  isEdit,
}: {
  projectID: number
  priorityID: number
  priority?: Priority
  setEditPriorityID: (priorityID: number) => void
  isEdit: boolean
}) {
  return isEdit ? (
    <PriorityPicker
      projectID={projectID}
      defaultValue={priorityID}
      setPriorityID={setEditPriorityID}
    />
  ) : (
    !!priorityID && !!priority && (
      <span>
        <PriorityTag priority={priority} />
      </span>
    )
  )
}
