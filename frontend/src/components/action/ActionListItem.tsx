import { BsCalendar } from "react-icons/bs"

import { Action } from "@/api/types"
import ActionTag from "@/components/action/ActionTag"
import DateString from "@/components/ui/DateString"
import Hr from "@/components/ui/Hr"
import { TagContainer } from "@/components/ui/tag/Tag"
import TagList from "@/components/ui/tag/TagList"
import {
  TruncateSubTitle,
  TruncateTitle,
} from "@/components/ui/text/TruncateText"
import UserAvatar from "@/components/user/UserAvatar"

export default function ActionListItem({
  action,
  selected = false,
}: {
  action: Action
  selected?: boolean
}) {
  return (
    <div
      key={action.ID}
      className={`rounded-md border border-neutral-700 p-3 hover:bg-neutral-900 ${
        selected ? "bg-neutral-900" : ""
      }`}
    >
      <div className="mb-2 flex w-full items-center justify-between">
        <div className="h-fit rounded-md bg-neutral-800 px-2 py-1 text-xs">
          {action.priority_id && action.priority?.title}
        </div>
        {action.due_date?.Valid && (
          <div className="flex h-fit items-center space-x-2 rounded-md bg-neutral-800 px-2 py-1 text-xs">
            <BsCalendar />
            <span>
              <DateString date value={new Date(action.due_date.Time)} />
            </span>
          </div>
        )}
        <div className="flex space-x-1">
          {action.assigned_users?.map(
            (user, index) =>
              index < 3 && (
                <div key={user.id} className="h-5 w-5">
                  <UserAvatar userID={user.id} />
                </div>
              ),
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div>
          <ActionTag action={action} className="text-xs" />
        </div>
        <div>
          <TruncateTitle truncate={20} className="text-neutral-50">
            {action.title}
          </TruncateTitle>
        </div>
      </div>
      <TruncateSubTitle truncate={20} className="text-neutral-300">
        {action.description}
      </TruncateSubTitle>
      {action.tags && (
        <>
          <Hr className="my-2" />
          <TagList>
            {action.tags.map((tag) => (
              <TagContainer
                key={tag.ID}
                style="color"
                color={tag.color}
                className="text-xs"
              >
                {tag.title}
              </TagContainer>
            ))}
          </TagList>
        </>
      )}
    </div>
  )
}
