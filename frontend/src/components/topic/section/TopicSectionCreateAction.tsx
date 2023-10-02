import { useState } from "react"
import {
  BsEyeFill,
  BsEyeSlash,
  BsPlusCircleDotted,
  BsShare,
} from "react-icons/bs"
import { toast } from "sonner"

import ActionCreateModal from "@/components/action/modals/ActionCreateModal"
import Button from "@/components/ui/Button"
import Flex from "@/components/ui/layout/Flex"
import ModalPopup from "@/components/ui/modal/ModalPopup"
import { useAuth } from "@/contexts/AuthContext"

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

  const { topics } = useAuth()
  const subscribedQuery = topics!.useIsSubscribed(projectID, meetingID, topicID)
  const subscribeMut = topics!.useSubscribe(
    projectID,
    meetingID,
    topicID,
    ({ data }) =>
      toast.success(
        `${data ? "Subscribed to" : "Unsubscribed from"} topic #${topicID}`,
      ),
  )
  const isSubscribed = subscribedQuery.data?.data

  return (
    <Flex col gap={2}>
      <Flex gap={2}>
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
      </Flex>
      <Button
        icon={isSubscribed ? <BsEyeSlash /> : <BsEyeFill />}
        isLoading={subscribeMut.isLoading}
        onClick={() =>
          subscribeMut.mutate({
            subscribe: !isSubscribed,
          })
        }
      >
        {isSubscribed ? "Unsubscribe" : "Subscribe"}
      </Button>
    </Flex>
  )
}
