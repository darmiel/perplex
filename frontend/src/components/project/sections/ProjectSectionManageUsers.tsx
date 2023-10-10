import { Button, ScrollShadow, Tooltip } from "@nextui-org/react"
import { useState } from "react"
import { BsPersonAdd } from "react-icons/bs"

import { extractErrorMessage } from "@/api/util"
import ProjectModalManageUsers from "@/components/project/modals/ProjectModalManageUsers"
import ModalPopup from "@/components/ui/modal/ModalPopup"
import OverviewSection from "@/components/ui/overview/OverviewSection"
import UserTagList from "@/components/ui/tag/UserTagList"
import { useAuth } from "@/contexts/AuthContext"

export default function ProjectSectionManageUsers({
  projectID,
  isOwner = false,
}: {
  projectID: number
  isOwner?: boolean
}) {
  const [showUserControl, setShowUserControl] = useState(false)

  const { projects } = useAuth()
  const projectUsersQuery = projects!.useUserList(projectID)

  if (projectUsersQuery.isLoading) {
    return <>Loading Users...</>
  }

  if (projectUsersQuery.isError) {
    return (
      <>
        <strong>Failed to load users:</strong>
        <pre>{extractErrorMessage(projectUsersQuery.error)}</pre>
      </>
    )
  }

  return (
    <OverviewSection
      name="Members"
      badge={projectUsersQuery.data.data.length}
      endContent={
        isOwner && (
          <Tooltip content="Manage Users in Project">
            <Button
              size="sm"
              startContent={<BsPersonAdd />}
              onClick={() => setShowUserControl(true)}
              variant="flat"
            >
              Manage
            </Button>
          </Tooltip>
        )
      }
    >
      <ModalPopup open={showUserControl} setOpen={setShowUserControl}>
        <ProjectModalManageUsers
          projectID={projectID}
          onClose={() => setShowUserControl(false)}
        />
      </ModalPopup>

      <ScrollShadow className="max-h-36">
        <UserTagList users={projectUsersQuery.data.data} />
      </ScrollShadow>
    </OverviewSection>
  )
}
