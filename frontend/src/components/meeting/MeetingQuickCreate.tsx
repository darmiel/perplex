import { Event } from "cal-parser"
import clsx from "clsx"
import { useRouter } from "next/router"
import { useState } from "react"
import { BsCheckCircleFill, BsCircle } from "react-icons/bs"
import { toast } from "sonner"

import Button from "@/components/ui/Button"
import { RelativeDate } from "@/components/ui/DateString"
import Hr from "@/components/ui/Hr"
import Flex from "@/components/ui/layout/Flex"
import ModalContainer from "@/components/ui/modal/ModalContainer"
import { useAuth } from "@/contexts/AuthContext"

export default function MeetingQuickCreate({
  projectID,
  events,
  onCreate,
}: {
  projectID: number
  events: Event[]
  onCreate: () => void
}) {
  const [checked, setChecked] = useState((): number[] => {
    return events.map((_, index) => index)
  })

  const router = useRouter()

  const { meetings } = useAuth()
  const meetingCreateMut = meetings!.useCreate(projectID, ({ data }) => {
    toast.success(`Created meeting ${data.ID}`, {
      action: {
        label: "Go to Meeting",
        onClick: () => {
          router.push(`/project/${projectID}/meeting/${data.ID}`)
        },
      },
    })
  })

  function createSelected() {
    const selectedEvents = events.filter((_, index) => checked.includes(index))
    selectedEvents
      .filter((event) => event.dtstart && event.dtend)
      .forEach((event) => {
        meetingCreateMut.mutate({
          title: event.summary?.value ?? "Unknown Title",
          description: event.description?.value ?? "",
          start_date: event.dtstart!.value,
          end_date: event.dtend!.value,
          __should_close: false,
        })
      })
    onCreate()
  }

  return (
    <ModalContainer title={`Found ${events.length} events`} className="!p-4">
      <div className="flex max-h-56 flex-col gap-2 overflow-y-auto">
        {events.map((event, index) => {
          const isChecked = checked.includes(index)
          const isValid = event.dtstart && event.dtend
          return (
            <>
              {index !== 0 && <Hr />}
              <button
                key={index}
                className={clsx(
                  "flex items-center space-x-4 rounded-md px-3 py-2 text-left",
                  {
                    "border border-primary-500 bg-primary-500 bg-opacity-10":
                      isChecked,
                    "border border-red-500": !isValid,
                  },
                )}
                onClick={() =>
                  isChecked
                    ? setChecked((prev) => prev.filter((i) => i !== index))
                    : setChecked((prev) => [...prev, index])
                }
              >
                <span>{isChecked ? <BsCheckCircleFill /> : <BsCircle />}</span>
                <div>
                  <span className="text-lg font-bold">
                    {event.summary?.value ?? "Unknown Title"}
                  </span>
                  <Flex span className="space-x-2">
                    {isValid ? (
                      <>
                        <span>From</span>
                        <span className="text-neutral-400">
                          {event.dtstart ? (
                            <RelativeDate date={event.dtstart.value} />
                          ) : (
                            "No Date"
                          )}
                        </span>
                        <span>to</span>
                        <span className="text-neutral-400">
                          {event.dtend ? (
                            <RelativeDate date={event.dtend.value} />
                          ) : (
                            "No Date"
                          )}
                        </span>
                      </>
                    ) : (
                      <span className="text-red-500">Event is invalid</span>
                    )}
                  </Flex>
                </div>
              </button>
            </>
          )
        })}
      </div>
      <Button
        style={checked.length === 0 ? "neutral" : "primary"}
        disabled={checked.length === 0}
        isLoading={meetingCreateMut.isLoading}
        onClick={() => createSelected()}
      >
        Import {checked.length} Meetings and Close
      </Button>
    </ModalContainer>
  )
}
