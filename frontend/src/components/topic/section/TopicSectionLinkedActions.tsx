import { useState } from "react"

import { Action, Topic } from "@/api/types"
import ActionCardLarge from "@/components/action/cards/ActionCardLarge"
import ActionPeekModal from "@/components/action/modals/ActionItemPeek"
import ModalPopup from "@/components/ui/modal/ModalPopup"

export default function TopicSectionLinkedActions({
  projectID,
  topic,
  actions,
}: {
  projectID: number
  topic: Topic
  actions: Action[]
}) {
  const [showActionPeek, setShowActionPeek] = useState(false)
  const [actionPeekItem, setActionPeekItem] = useState<Action | null>(null)

  return (
    <>
      <div className="flex space-x-2 overflow-y-auto">
        {actions.map((action) => (
          <ActionCardLarge
            key={action.ID}
            hideProjectName
            className="w-80 max-w-sm"
            action={action}
            onClick={() => {
              setActionPeekItem(action)
              setShowActionPeek(true)
            }}
          />
        ))}
      </div>
      {/* Quick Peek Action */}
      <ModalPopup
        open={showActionPeek && !!actionPeekItem}
        setOpen={setShowActionPeek}
      >
        <ActionPeekModal
          action={actionPeekItem!}
          onClose={() => {
            setShowActionPeek(false)
          }}
        />
      </ModalPopup>
    </>
  )
}
