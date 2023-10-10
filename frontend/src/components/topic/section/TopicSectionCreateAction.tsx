import { Button, ScrollShadow, Tooltip } from "@nextui-org/react"
import clsx from "clsx"
import Link from "next/link"
import { useState } from "react"
import {
  BsBack,
  BsCheck,
  BsPlusCircleFill,
  BsRecord2,
  BsX,
} from "react-icons/bs"

import ActionCreateModal from "@/components/action/modals/ActionCreateModal"
import ActionLinkTopicModal from "@/components/action/modals/ActionLinkTopicModal"
import Flex from "@/components/ui/layout/Flex"
import ModalPopup from "@/components/ui/modal/ModalPopup"
import OverviewSection from "@/components/ui/overview/OverviewSection"
import { TruncateTitle } from "@/components/ui/text/TruncateText"
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

  const { actions } = useAuth()
  const listTopicsForActionsQuery = actions!.useListForTopic(
    projectID,
    meetingID,
    topicID,
  )
  const linkTopicToActionMutation = actions!.useLinkTopic(projectID)

  return (
    <OverviewSection
      name="Actions"
      badge={listTopicsForActionsQuery.data?.data.length}
      endContent={
        <Flex gap={2}>
          <Tooltip content="Create Action">
            <Button
              isIconOnly
              startContent={<BsPlusCircleFill />}
              size="sm"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                setShowCreateModal(true)
              }}
            />
          </Tooltip>
          <Tooltip content="Link Topic">
            <Button
              isIconOnly
              startContent={<BsBack />}
              size="sm"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                setShowLinkModal(true)
              }}
            />
          </Tooltip>
        </Flex>
      }
    >
      <ScrollShadow className="flex max-h-48 flex-col">
        {listTopicsForActionsQuery.data?.data.map((action) => (
          <Link
            className={clsx(
              "flex items-center justify-between rounded-md border border-transparent p-2 transition duration-150 ease-in-out",
              "hover:border-neutral-800 hover:bg-neutral-900",
            )}
            key={action.ID}
            href={`/project/${projectID}/action/${action.ID}`}
          >
            <Flex gap={2}>
              <span
                className={clsx({
                  "text-neutral-500": action.closed_at.Valid,
                  "text-red-500": !action.closed_at.Valid,
                })}
              >
                {action.closed_at.Valid ? <BsCheck /> : <BsRecord2 />}
              </span>
              <TruncateTitle truncate={20} className="truncate">
                {action.title}
              </TruncateTitle>
            </Flex>
            <Button
              isIconOnly
              startContent={<BsX />}
              variant="light"
              size="sm"
              isLoading={linkTopicToActionMutation.isLoading}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                linkTopicToActionMutation.mutate({
                  actionID: action.ID,
                  link: false,
                  meetingID: meetingID,
                  topicID: topicID,
                })
              }}
            />
          </Link>
        ))}
      </ScrollShadow>

      <ModalPopup open={showCreateModal} setOpen={setShowCreateModal}>
        <ActionCreateModal
          onClose={() => setShowCreateModal(false)}
          projectID={projectID}
          meetingID={meetingID}
          topicID={topicID}
        />
      </ModalPopup>
      <ModalPopup open={showLinkModal} setOpen={setShowLinkModal}>
        <ActionLinkTopicModal
          onClose={() => setShowLinkModal(false)}
          projectID={projectID}
          meetingID={meetingID}
          topicID={topicID}
        />
      </ModalPopup>
    </OverviewSection>
  )
}
