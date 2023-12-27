import { Textarea } from "@nextui-org/react"
import { useState } from "react"
import { BsEye } from "react-icons/bs"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"

import RenderMarkdown from "@/components/ui/text/RenderMarkdown"

export function EditOrRenderMarkdown({
  isEdit,
  displayValue,
  editValue,
  setEditValue,
  className,
  autoSaveId,
}: {
  isEdit: boolean
  displayValue: string
  editValue: string
  setEditValue: (newValue: string) => void
  className?: string
  autoSaveId: string
}) {
  const [showPreview, setShowPreview] = useState(true)
  if (!isEdit) {
    return <RenderMarkdown markdown={displayValue} className={className} />
  }

  return (
    <PanelGroup
      autoSaveId={autoSaveId}
      direction="horizontal"
      className="space-x-4"
    >
      <Panel order={1} defaultSizePercentage={100} collapsible={false}>
        <Textarea
          className="w-full"
          defaultValue={editValue}
          onValueChange={setEditValue}
          maxRows={100}
        />
      </Panel>
      <PanelResizeHandle className="flex w-4 items-center justify-center text-lg">
        <span>
          <BsEye />
        </span>
      </PanelResizeHandle>
      <Panel
        order={2}
        defaultSizePercentage={0}
        collapsible={true}
        collapsedSizePixels={0}
        onResize={(mixed) => setShowPreview(mixed.sizePercentage > 10)}
      >
        {showPreview && (
          <RenderMarkdown
            markdown={editValue}
            className="h-full rounded-lg border border-yellow-400 p-2"
          />
        )}
      </Panel>
    </PanelGroup>
  )
}
