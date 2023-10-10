import { Button, Input, ScrollShadow } from "@nextui-org/react"
import clsx from "clsx"
import { useState } from "react"
import { BsCheck, BsLink, BsRecord2, BsSearch } from "react-icons/bs"

import { includesFold } from "@/api/util"
import Hr from "@/components/ui/Hr"
import Flex from "@/components/ui/layout/Flex"
import ModalContainerNG from "@/components/ui/modal/ModalContainerNG"
import { TruncateTitle } from "@/components/ui/text/TruncateText"
import { useAuth } from "@/contexts/AuthContext"

export default function ActionLinkTopicModal({
  projectID,
  meetingID,
  topicID,
  onClose,
}: {
  projectID: number
  meetingID: number
  topicID: number
  onClose: () => void
}) {
  const [filter, setFilter] = useState("")

  const { actions } = useAuth()

  const listActionsQuery = actions!.useListForProject(projectID)
  const linkedActionsQuery = actions!.useListForTopic(
    projectID,
    meetingID,
    topicID,
  )
  const linkTopicToActionMut = actions!.useLinkTopic(projectID)

  return (
    <ModalContainerNG title={`Link Action to ${topicID}`} onClose={onClose}>
      <Input
        variant="bordered"
        value={filter}
        onValueChange={setFilter}
        startContent={<BsSearch />}
        placeholder={`Search in Actions...`}
        width="100%"
      />

      <Hr />

      <ScrollShadow className="max-h-96">
        {listActionsQuery.data?.data
          .filter((action) => !filter || includesFold(action.title, filter))
          .map((action) => {
            const wasAdded = linkedActionsQuery.data?.data.some(
              (linkedAction) => linkedAction.ID === action.ID,
            )
            return (
              <Flex
                justify="between"
                className={clsx(
                  "rounded-md border border-transparent p-2 transition duration-150 ease-in-out",
                  "hover:border-neutral-800 hover:bg-neutral-900",
                )}
                key={action.ID}
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
                  <TruncateTitle
                    truncate={40}
                    className={clsx("truncate", {
                      "text-neutral-500 line-through": wasAdded,
                    })}
                  >
                    {action.title}
                  </TruncateTitle>
                </Flex>
                <Button
                  startContent={<BsLink />}
                  variant={wasAdded ? "light" : "solid"}
                  size="sm"
                  isLoading={linkTopicToActionMut.isLoading}
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    linkTopicToActionMut.mutate({
                      actionID: action.ID,
                      link: true,
                      meetingID: meetingID,
                      topicID: topicID,
                    })
                  }}
                  isDisabled={wasAdded}
                >
                  Link
                </Button>
              </Flex>
            )
          })}
      </ScrollShadow>
    </ModalContainerNG>
  )
}
