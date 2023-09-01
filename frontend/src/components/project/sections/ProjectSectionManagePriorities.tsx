import { useState } from "react"
import { BsTriangle } from "react-icons/bs"

import ProjectModalManagePriorities from "@/components/project/modals/ProjectModalManagePriorities"
import Button from "@/components/ui/Button"
import ModalPopup from "@/components/ui/modal/ModalPopup"
import { PriorityTag } from "@/components/ui/tag/Tag"
import TagList from "@/components/ui/tag/TagList"
import { useAuth } from "@/contexts/AuthContext"

export default function ProjectSectionManagePriorities({
  projectID,
  isOwner = false,
}: {
  projectID: number
  isOwner?: boolean
}) {
  const [showPriorityControl, setShowPriorityControl] = useState(false)

  const { priorities } = useAuth()
  const projectPrioritiesQuery = priorities!.useList(projectID)

  return (
    <>
      <ModalPopup open={showPriorityControl} setOpen={setShowPriorityControl}>
        <ProjectModalManagePriorities
          projectID={projectID}
          onClose={() => setShowPriorityControl(false)}
        />
      </ModalPopup>
      <TagList>
        {projectPrioritiesQuery.isLoading
          ? "Loading Priorities..."
          : projectPrioritiesQuery.data?.data.map((priority) => (
              <PriorityTag priority={priority} key={priority.ID} />
            ))}
      </TagList>
      <Button
        className="w-full mt-4"
        onClick={() => setShowPriorityControl(true)}
        icon={<BsTriangle />}
        disabled={!isOwner}
      >
        Manage Priorities
      </Button>
    </>
  )
}
