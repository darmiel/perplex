import { useState } from "react"
import { BsTag } from "react-icons/bs"

import ProjectModalManageTags from "@/components/project/modals/ProjectModalManageTags"
import Button from "@/components/ui/Button"
import ModalPopup from "@/components/ui/modal/ModalPopup"
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

  const { useTagsListQuery } = useAuth()
  const projectTagsQuery = useTagsListQuery!(projectID)

  return (
    <>
      <ModalPopup open={showTagControl} setOpen={setShowTagControl}>
        <ProjectModalManageTags
          projectID={projectID}
          onClose={() => setShowTagControl(false)}
        />
      </ModalPopup>
      <TagList>
        {projectTagsQuery.isLoading
          ? "Loading Tags..."
          : projectTagsQuery.data?.data.map((tag) => (
              <TagComponent
                key={tag.ID}
                className="text-white"
                style={{
                  backgroundColor: tag.color,
                }}
              >
                {tag.title}
              </TagComponent>
            ))}
      </TagList>
      <Button
        className="w-full mt-4"
        onClick={() => setShowTagControl(true)}
        icon={<BsTag />}
        disabled={!isOwner}
      >
        Manage Tags
      </Button>
    </>
  )
}
