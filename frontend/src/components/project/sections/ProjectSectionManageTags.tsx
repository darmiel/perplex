import { Button, ScrollShadow } from "@nextui-org/react"
import { useState } from "react"
import { BsTags } from "react-icons/bs"

import ProjectModalManageTags from "@/components/project/modals/ProjectModalManageTags"
import ModalPopup from "@/components/ui/modal/ModalPopup"
import OverviewSection from "@/components/ui/overview/OverviewSection"
import TagComponent from "@/components/ui/tag/Tag"
import TagList from "@/components/ui/tag/TagList"
import { useAuth } from "@/contexts/AuthContext"

export default function ProjectSectionManageTags({
  projectID,
  isOwner = false,
}: {
  projectID: number
  isOwner?: boolean
}) {
  const [showTagControl, setShowTagControl] = useState(false)

  const { tags } = useAuth()
  const projectTagsQuery = tags!.useList(projectID)

  return (
    <OverviewSection
      name="Project Tags"
      badge={projectTagsQuery.data?.data.length}
      endContent={
        isOwner && (
          <Button
            size="sm"
            startContent={<BsTags />}
            onClick={() => setShowTagControl(true)}
            variant="flat"
          >
            Manage
          </Button>
        )
      }
    >
      <ModalPopup open={showTagControl} setOpen={setShowTagControl}>
        <ProjectModalManageTags
          projectID={projectID}
          onClose={() => setShowTagControl(false)}
        />
      </ModalPopup>
      <ScrollShadow className="max-h-36">
        <TagList>
          {projectTagsQuery.isLoading
            ? "Loading Tags..."
            : projectTagsQuery.data?.data.map((tag) => (
                <TagComponent
                  key={tag.ID}
                  className="border"
                  style={{
                    borderColor: tag.color,
                    color: tag.color,
                  }}
                >
                  {tag.title}
                </TagComponent>
              ))}
        </TagList>
      </ScrollShadow>
    </OverviewSection>
  )
}
