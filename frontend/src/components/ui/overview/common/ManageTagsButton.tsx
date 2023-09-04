import { useState } from "react"
import { BsGear } from "react-icons/bs"

import ProjectModalManageTags from "@/components/project/modals/ProjectModalManageTags"
import ModalPopup from "@/components/ui/modal/ModalPopup"

export default function ManageTagsButton({ projectID }: { projectID: number }) {
  const [showManageTags, setShowManageTags] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowManageTags(true)}
        className="group flex items-center space-x-1 rounded-md border border-transparent bg-neutral-800 px-2 py-1 transition duration-300 ease-in-out hover:border-neutral-800 hover:bg-transparent"
      >
        <span className="group-hover:animate-spin">
          <BsGear />
        </span>

        <span>Manage Tags</span>
      </button>
      <ModalPopup open={showManageTags} setOpen={setShowManageTags}>
        <ProjectModalManageTags
          projectID={projectID}
          onClose={() => setShowManageTags(false)}
        />
      </ModalPopup>
    </>
  )
}
