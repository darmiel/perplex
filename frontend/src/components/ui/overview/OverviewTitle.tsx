import { ReactNode } from "react"

import ResolveUserName from "@/components/user/ResolveUserName"

import DateString from "../DateString"
import Hr from "../Hr"

export default function OverviewTitle({
  creatorID,
  title,
  titleID,
  tag,
  createdAt,

  setEditTitle,

  isEdit,
  className = "",
}: {
  creatorID: string
  title: string
  titleID?: any
  tag?: ReactNode
  createdAt?: Date

  setEditTitle: (title: string) => void

  isEdit: boolean
  className?: string
}) {
  return (
    <div className={`w-full ${className}`}>
      <h1 className="text-2xl mt-1 space-x-2">
        {isEdit ? (
          <input
            className="w-full bg-transparent border-b border-gray-700 focus:outline-none"
            defaultValue={title}
            onChange={(e) => setEditTitle(e.target.value)}
          />
        ) : (
          <span className="font-bold">{title}</span>
        )}
        {titleID && <span className="text-neutral-400">#{titleID}</span>}
      </h1>

      <div className="flex flex-row items-center text-neutral-500 space-x-2 mt-2">
        {tag && <div>{tag}</div>}
        <div>
          <ResolveUserName userID={creatorID} />
          <> created on </>
          <DateString value={createdAt} date time />
        </div>
      </div>

      <Hr className="my-4" />
    </div>
  )
}
