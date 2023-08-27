import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"
import { BsArrowLeft, BsListTask } from "react-icons/bs"
import { BarLoader } from "react-spinners"

import { Action, BackendResponse } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import ActionListItem from "@/components/action/ActionListItem"
import Button from "@/components/ui/Button"
import Hr from "@/components/ui/Hr"
import ModalContainer from "@/components/ui/modal/ModalContainer"
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
  const { axios } = useAuth()

  const router = useRouter()

  const listActionQuery = useQuery<BackendResponse<Action[]>>({
    queryKey: [{ projectID: String(projectID) }, "actions"],
    queryFn: async () =>
      (await axios!.get(`/project/${projectID}/action`)).data,
  })
  if (listActionQuery.isLoading) {
    return <BarLoader color="white" />
  }
  if (listActionQuery.isError) {
    return (
      <div>
        Error: <pre>{extractErrorMessage(listActionQuery.error)}</pre>
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

      {listActionQuery.data.data.map((action) => (
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

      {/* Create Meeting Popup */}
      <ModalPopup open={showCreateAction} setOpen={setShowCreateAction}>
        <ModalContainer title="Create Action">
          <span>Work in Progress</span>
        </ModalContainer>
      </ModalPopup>
    </>
  )
}
