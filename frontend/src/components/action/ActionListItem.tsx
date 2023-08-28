import { BsCalendar } from "react-icons/bs"

import { Action } from "@/api/types"
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
      className={`p-3 border border-neutral-700 rounded-md hover:bg-neutral-900 ${
        selected ? "bg-neutral-900" : ""
      }`}
    >
      <div className="w-full mb-2 flex justify-between items-center">
        <div className="bg-neutral-800 rounded-md py-1 px-2 text-xs h-fit">
          {action.priority_id && action.priority?.title}
        </div>
        {action.due_date?.Valid && (
          <div className="bg-neutral-800 rounded-md py-1 px-2 text-xs h-fit flex items-center space-x-2">
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
                <div key={user.id} className="w-5 h-5">
                  <UserAvatar userID={user.id} />
                </div>
              ),
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div>
          <TagContainer
            style="color"
            color={action.closed_at.Valid ? "red" : "#16a34a"}
            className="text-xs"
          >
            {action.closed_at.Valid ? "Closed" : "Open"}
          </TagContainer>
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
