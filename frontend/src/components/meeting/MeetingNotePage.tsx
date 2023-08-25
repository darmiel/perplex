import { useState } from "react"

import RenderMarkdown from "../ui/text/RenderMarkdown"

/**
 * This page is a work in progress.
 * @returns MeetingNotePage Component
 */
export default function MeetingNotePage() {
  const [content, setContent] = useState("")

  return (
    <div className="flex flex-row h-full">
      {/* Write */}
      <div className="w-1/2">
        <textarea
          className="w-full h-full px-3 py-2 bg-neutral-900 border border-neutral-700"
          placeholder="Write your notes..."
          rows={8}
          onChange={(e) => setContent(e.target.value)}
          value={content}
        ></textarea>
      </div>
      {/* Preview */}
      <div className="w-1/2">
        <div className="p-4">
          <RenderMarkdown markdown={content} />
        </div>
      </div>
    </div>
  )
}
