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
      } flex w-full items-center justify-between space-x-6 rounded-md px-2 py-1`}
    >
      <div className="flex h-full space-x-2">
        <button
          className={
            isUnread
              ? "text-neutral-200 transition duration-700 ease-in-out hover:rotate-[360deg] hover:text-blue-500"
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
              <span className="rounded-md border border-neutral-700 p-1 text-[0.5rem] font-normal uppercase text-neutral-500">
                {notification.suffix}
              </span>
            )}
            <span className="text-sm font-normal text-neutral-500">
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
          className="group space-x-1 rounded-md border border-neutral-600 bg-neutral-800 px-2 py-1 text-sm transition-all duration-300 ease-in-out hover:border-transparent hover:bg-transparent"
          // if the user clicks on the link in the notification, mark it as read
          onClick={() => read()}
        >
          {notification.link_title && <span>{notification.link_title}</span>}
          <span className="translate inline-block transition-all duration-300 ease-in-out group-hover:translate-x-1 group-hover:text-primary-500">
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
    <section className="h-fit w-fit space-y-2 rounded-md border border-neutral-700 bg-section-darker p-4">
      <div className="flex items-center justify-between space-x-2">
        <div className="flex items-center space-x-2">
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
            className="flex items-center space-x-1 rounded-full border border-transparent bg-neutral-800 px-2 transition-all hover:animate-pulse hover:border-neutral-700 hover:bg-transparent hover:px-4"
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
            className="flex items-center space-x-2 rounded-full border border-neutral-800 px-2 py-1"
          >
            {unreadOnly ? <BsCheckCircleFill /> : <BsCircle />}
            <span className="text-sm text-neutral-400">Unread only</span>
          </button>
        </div>
        <button
          onClick={() => onClose?.()}
          className="transition duration-300 ease-in-out hover:rotate-90 hover:text-red-500"
        >
          <BsX />
        </button>
      </div>
      <div className="max-h-64 space-y-2 overflow-y-auto">
        {notifications.map((notification) => (
          <NotificationItem key={notification.ID} notification={notification} />
        ))}
      </div>
    </section>
  )
}
