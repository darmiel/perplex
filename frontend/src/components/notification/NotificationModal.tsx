import Link from "next/link"
import {
  BsCheck,
  BsCheckAll,
  BsCheckCircleFill,
  BsCircle,
  BsClock,
  BsX,
} from "react-icons/bs"
import { BarLoader } from "react-spinners"
import { toast } from "sonner"

import { Notification } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import BadgeHeader from "@/components/ui/BadgeHeader"
import { RelativeDate } from "@/components/ui/DateString"
import { useAuth } from "@/contexts/AuthContext"
import { useLocalBoolState } from "@/hooks/localStorage"

function NotificationItem({ notification }: { notification: Notification }) {
  const { users } = useAuth()
  const notificationReadMutation = users!.useNotificationRead(() => {})
  const isUnread = !notification.read_at.Valid

  function read() {
    notificationReadMutation.mutate({ notificationID: notification.ID })
  }

  return (
    <div
      className={`${
        isUnread ? "bg-neutral-800" : "bg-neutral-900"
      } rounded-md px-2 py-1 flex justify-between items-center space-x-6 w-full`}
    >
      <div className="h-full flex space-x-2">
        <button
          className={
            isUnread
              ? "text-neutral-200 transition ease-in-out duration-700 hover:rotate-[360deg] hover:text-blue-500"
              : "text-neutral-600"
          }
          onClick={() => read()}
          disabled={!isUnread || notificationReadMutation.isLoading}
        >
          {notificationReadMutation.isLoading ? <BsClock /> : <BsCheck />}
        </button>
        <div className={isUnread ? "text-white" : "text-neutral-400"}>
          <h3
            className={`${
              isUnread ? "font-semibold" : "font-normal"
            } flex items-center space-x-1`}
          >
            <span>{notification.title}</span>
            {notification.suffix && (
              <span className="text-[0.5rem] font-normal rounded-md border border-neutral-700 text-neutral-500 p-1 uppercase">
                {notification.suffix}
              </span>
            )}
            <span className="text-neutral-500 font-normal text-sm">
              - <RelativeDate date={new Date(notification.CreatedAt)} />
            </span>
          </h3>
          <p className="text-sm">{notification.description}</p>
        </div>
      </div>

      {/* Buttons */}
      {notification.link && (
        <Link
          href={notification.link}
          className="bg-neutral-800 border border-neutral-600 px-2 py-1 rounded-md text-sm space-x-1 group transition-all duration-300 ease-in-out hover:border-transparent hover:bg-transparent"
          // if the user clicks on the link in the notification, mark it as read
          onClick={() => read()}
        >
          {notification.link_title && <span>{notification.link_title}</span>}
          <span className="transition-all duration-300 ease-in-out translate inline-block group-hover:translate-x-1 group-hover:text-primary-500">
            -&gt;
          </span>
        </Link>
      )}
    </div>
  )
}

export default function NotificationModal({
  onClose,
}: {
  onClose?: () => void
}) {
  const [unreadOnly, setUnreadOnly] = useLocalBoolState(
    "notifications/unread-only",
    false,
  )
  const { users } = useAuth()
  const notificationListQuery = users!.useNotificationAll()
  const notificationReadAllMutation = users!.useNotificationReadAll(() => {})

  if (notificationListQuery.isLoading) {
    return <BarLoader />
  }
  if (notificationListQuery.isError) {
    toast.error("Cannot load Notifications:", {
      description: extractErrorMessage(notificationListQuery.error),
    })
    return <>Error loading notifications</>
  }

  const notifications = notificationListQuery.data.data.filter((n) =>
    unreadOnly ? !n.read_at.Valid : true,
  )
  const unreadCount = notifications.filter((n) => !n.read_at.Valid).length

  return (
    <section className="bg-section-darker rounded-md border border-neutral-700 p-4 w-fit h-fit space-y-2">
      <div className="flex space-x-2 items-center justify-between">
        <div className="flex space-x-2 items-center">
          <BadgeHeader
            title="Notifications"
            badge={unreadCount}
            badgeColors={
              !unreadCount
                ? "bg-neutral-700 text-white"
                : "bg-red-500 text-white"
            }
          />
          <button
            className="flex space-x-1 items-center rounded-full bg-neutral-800 px-2 transition-all hover:animate-pulse hover:px-4 hover:bg-transparent border border-transparent hover:border-neutral-700"
            onClick={() => notificationReadAllMutation.mutate()}
            disabled={
              notificationReadAllMutation.isLoading || unreadCount === 0
            }
          >
            {notificationReadAllMutation.isLoading ? (
              <BsClock />
            ) : (
              <BsCheckAll />
            )}
            <span>All Read</span>
          </button>
          {/* Checkbox to show only unread notifications with label "Unread only" styled to fit the design */}

          <button
            onClick={() => setUnreadOnly((prev) => !prev)}
            className="flex space-x-2 items-center py-1 px-2 border border-neutral-800 rounded-full"
          >
            {unreadOnly ? <BsCheckCircleFill /> : <BsCircle />}
            <span className="text-neutral-400 text-sm">Unread only</span>
          </button>
        </div>
        <button
          onClick={() => onClose?.()}
          className="transition ease-in-out duration-300 hover:rotate-90 hover:text-red-500"
        >
          <BsX />
        </button>
      </div>
      <div className="max-h-64 overflow-y-auto space-y-2">
        {notifications.map((notification) => (
          <NotificationItem key={notification.ID} notification={notification} />
        ))}
      </div>
    </section>
  )
}
