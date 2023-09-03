import { useState } from "react"
import { BsPerson } from "react-icons/bs"

import { extractErrorMessage } from "@/api/util"
import ProjectModalManageUsers from "@/components/project/modals/ProjectModalManageUsers"
import Button from "@/components/ui/Button"
import ModalPopup from "@/components/ui/modal/ModalPopup"
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
    <>
      <ModalPopup open={showUserControl} setOpen={setShowUserControl}>
        <ProjectModalManageUsers
          projectID={projectID}
          onClose={() => setShowUserControl(false)}
        />
      </ModalPopup>

      <UserTagList users={projectUsersQuery.data.data} />

      <Button
        className="mt-4 w-full"
        onClick={() => setShowUserControl(true)}
        icon={<BsPerson />}
        disabled={!isOwner}
      >
        Manage Users
      </Button>
    </>
  )
}
