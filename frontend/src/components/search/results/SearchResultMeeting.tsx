import Link from "next/link"

import { Meeting } from "@/api/types"
import { RelativeDate } from "@/components/ui/DateString"
import ResolveUserName from "@/components/user/ResolveUserName"
import UserAvatar from "@/components/user/UserAvatar"

export default function SearchResultMeeting({
  meeting,
  onClick,
  onMouseOver,
}: {
  meeting: Meeting
  onClick: () => void
  onMouseOver: (link: string) => void
}) {
  const href = `/project/${meeting.project_id}/meeting/${meeting.ID}`
  return (
    <Link
      href={href}
      key={meeting.ID}
      className="flex items-center space-x-2 p-2 rounded-md hover:bg-neutral-800"
      onClick={() => onClick()}
      onMouseEnter={() => onMouseOver(href)}
    >
      <div className="h-5 w-5">
        <UserAvatar userID={String(meeting.ID)} />
      </div>
      <div className="flex flex-col">
        <h4 className="text-sm space-x-1">
          <span className="text-white">{meeting.name}</span>
          <span className="text-neutral-400">
            by <ResolveUserName userID={meeting.creator_id} />
          </span>
        </h4>
        <p className="text-xs text-neutral-500">
          <RelativeDate date={new Date(meeting.start_date)} />
        </p>
      </div>
    </Link>
  )
}
