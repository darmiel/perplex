import { useState } from "react"
import { BsGear } from "react-icons/bs"

import ProjectModalManageUsers from "@/components/project/modals/ProjectModalManageUsers"
import ModalPopup from "@/components/ui/modal/ModalPopup"

export default function ManageUsersButton({
  projectID,
}: {
  projectID: number
}) {
  const [showManageUsers, setShowManageUsers] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowManageUsers(true)}
        className="group flex items-center space-x-1 rounded-md border border-transparent bg-neutral-800 px-2 py-1 transition duration-300 ease-in-out hover:border-neutral-800 hover:bg-transparent"
      >
        <span className="group-hover:animate-spin">
          <BsGear />
        </span>

        <span>Manage Users</span>
      </button>
      <ModalPopup open={showManageUsers} setOpen={setShowManageUsers}>
        <ProjectModalManageUsers
          projectID={projectID}
          onClose={() => setShowManageUsers(false)}
        />
      </ModalPopup>
    </>
  )
}
