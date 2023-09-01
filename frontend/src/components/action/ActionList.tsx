import Link from "next/link"
import { useState } from "react"
import { BsArrowLeft, BsListTask } from "react-icons/bs"
import { BarLoader } from "react-spinners"

import { extractErrorMessage } from "@/api/util"
import ActionListItem from "@/components/action/ActionListItem"
import ActionCreateModal from "@/components/action/modals/ActionCreateModal"
import Button from "@/components/ui/Button"
import Hr from "@/components/ui/Hr"
import ModalPopup from "@/components/ui/modal/ModalPopup"
import { useAuth } from "@/contexts/AuthContext"

export default function ActionList({
  projectID,
  selectedActionID,
  displayCollapse = false,
  onCollapse,
  className = "",
}: {
  projectID: number
  selectedActionID?: number
  displayCollapse?: boolean
  onCollapse?: () => void
  className?: string
}) {
  const [showCreateAction, setShowCreateAction] = useState(false)

  const { actions } = useAuth()
  const { data, error, isLoading, isError } =
    actions!.useListForProject(projectID)

  if (isLoading) {
    return <BarLoader color="white" />
  }
  if (isError) {
    return (
      <div>
        Error: <pre>{extractErrorMessage(error)}</pre>
      </div>
    )
  }

  return (
    <>
      <div className={`flex flex-row space-x-2 ${className}`}>
        <Button
          onClick={() => setShowCreateAction(true)}
          style="neutral"
          icon={<BsListTask color="gray" size="1em" />}
          className="w-full"
        >
          Create Action
        </Button>
        {displayCollapse && (
          <Button onClick={onCollapse} style="neutral">
            <BsArrowLeft color="gray" size="1em" />
          </Button>
        )}
      </div>

      <Hr className="mt-4 mb-6 border-gray-700" />

      <div className="flex flex-col space-y-4">
        {data.data.map((action) => (
          <Link
            href={`/project/${projectID}/action/${action.ID}`}
            key={action.ID}
          >
            <ActionListItem
              action={action}
              selected={action.ID === selectedActionID}
            />
          </Link>
        ))}
      </div>

      {/* Create Meeting Popup */}
      <ModalPopup open={showCreateAction} setOpen={setShowCreateAction}>
        <ActionCreateModal
          projectID={projectID}
          onClose={() => setShowCreateAction(false)}
        />
      </ModalPopup>
    </>
  )
}
