import { useState } from "react"
import { BsPlusCircleDotted, BsShare } from "react-icons/bs"

import ActionCreateModal from "@/components/action/modals/ActionCreateModal"
import Button from "@/components/ui/Button"
import ModalPopup from "@/components/ui/modal/ModalPopup"

export default function TopicSectionCreateAction({
  projectID,
  meetingID,
  topicID,
}: {
  projectID: number
  meetingID: number
  topicID: number
}) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  return (
    <div className="flex space-x-2">
      <Button
        style="neutral"
        icon={<BsPlusCircleDotted />}
        className="w-1/2"
        onClick={() => setShowCreateModal(true)}
      >
        New
      </Button>
      <Button
        style="neutral"
        icon={<BsShare />}
        className="w-1/2"
        onClick={() => setShowLinkModal(true)}
        disabled={true}
      >
        Link
      </Button>
      <ModalPopup open={showCreateModal} setOpen={setShowCreateModal}>
        <ActionCreateModal
          onClose={() => setShowCreateModal(false)}
          projectID={projectID}
          meetingID={meetingID}
          topicID={topicID}
        />
      </ModalPopup>
      <ModalPopup open={showLinkModal} setOpen={setShowLinkModal}>
        a
      </ModalPopup>
    </div>
  )
}
