import { Button, ScrollShadow } from "@nextui-org/react"
import { useState } from "react"
import { BsTriangle } from "react-icons/bs"

import ProjectModalManagePriorities from "@/components/project/modals/ProjectModalManagePriorities"
import ModalPopup from "@/components/ui/modal/ModalPopup"
import OverviewSection from "@/components/ui/overview/OverviewSection"
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
    <OverviewSection
      name="Project Priorities"
      badge={projectPrioritiesQuery.data?.data.length}
      endContent={
        isOwner && (
          <Button
            size="sm"
            startContent={<BsTriangle />}
            onClick={() => setShowPriorityControl(true)}
            variant="flat"
          >
            Manage
          </Button>
        )
      }
    >
      <ModalPopup open={showPriorityControl} setOpen={setShowPriorityControl}>
        <ProjectModalManagePriorities
          projectID={projectID}
          onClose={() => setShowPriorityControl(false)}
        />
      </ModalPopup>

      <ScrollShadow className="max-h-36">
        <TagList>
          {projectPrioritiesQuery.isLoading
            ? "Loading Priorities..."
            : projectPrioritiesQuery.data?.data.map((priority) => (
                <PriorityTag priority={priority} key={priority.ID} />
              ))}
        </TagList>
      </ScrollShadow>
    </OverviewSection>
  )
}
