import { CSSProperties, ReactNode } from "react"

import { Tag as TagType } from "@/api/types"

export function TagFromType({ tag }: { tag: TagType }) {
  return (
    <Tag
      className="text-white"
      style={{
        backgroundColor: tag.color,
      }}
    >
      {tag.title}
    </Tag>
  )
}

export default function Tag({
  className = "bg-green-600 text-white",
  style,
  children,
}: {
  className?: string
  children: ReactNode
  style?: CSSProperties
}) {
  return (
    <div
      style={style}
      className={`rounded-full text-sm ${className} px-3 py-1 flex flex-row items-center space-x-1`}
    >
      {children}
    </div>
  )
}
