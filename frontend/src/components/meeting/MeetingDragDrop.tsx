import ical, { Event } from "cal-parser"
import clsx from "clsx"
import { useState } from "react"
import { BsCalendarPlus, BsCalendarPlusFill } from "react-icons/bs"
import { toast } from "sonner"

import MeetingQuickCreate from "@/components/meeting/MeetingQuickCreate"
import ModalPopup from "@/components/ui/modal/ModalPopup"

function extractCalendarContent(content: string): string {
  let base64 = false
  const calendarContent = []

  // scanning indicates whether we are currently scanning the calendar content
  let scanning = false

  // close indicates whether we might have reached the end of the calendar content
  let close = false

  for (let line of content.split("\n")) {
    line = line.trim()

    if (line.startsWith("Content-Transfer-Encoding: base64")) {
      scanning = true
      base64 = true
      continue
    } else if (line.startsWith("BEGIN:VCALENDAR")) {
      scanning = true
      calendarContent.push(line)
      continue
    }

    if (scanning) {
      if (line) {
        calendarContent.push(line)
      } else {
        if (close) {
          break
        }
        close = true
      }
    }
  }
  return base64 ? atob(calendarContent.join("")) : calendarContent.join("\n")
}

function parseFile(file: File): Promise<Event[]> | undefined {
  // file size shouldn't exceed 10 MiB
  if (file.size > 1024 * 1024 * 10) {
    toast.error("Hold up! This file is too large.")
    return
  }

  // file type should be .ics
  const isCalendar = file.type === "text/calendar"
  if (!isCalendar) {
    toast.message(
      "This file is not a calendar file. I'll try to parse it anyway but no promises.",
    )
  }

  const reader = new FileReader()
  reader.readAsText(file, "UTF-8")

  return new Promise((accept) => {
    reader.onload = () => {
      const content = reader.result as string
      const calendar = isCalendar ? content : extractCalendarContent(content)
      const parsed = ical.parseString(calendar as string)
      accept(parsed.events)
    }
  })
}

export default function MeetingDragDrop({
  projectID,
  className = "w-full",
}: {
  projectID: number
  className?: string
}) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [events, setEvents] = useState<Event[]>([])

  async function onDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragOver(false)

    const events: Event[] = []
    if (event.dataTransfer.files) {
      for (let i = 0; i < event.dataTransfer.files.length; i++) {
        const file = event.dataTransfer.files[i]

        const parsedEvents = await parseFile(file)
        if (parsedEvents) {
          events.push(...parsedEvents)
        }
      }
    }

    if (events.length === 0) {
      toast.error("No events found!")
    }

    setEvents(events)
  }

  return (
    <>
      <div
        className={clsx(
          "flex h-32 items-center justify-center rounded-md border-2 border-dashed border-neutral-700",
          className,
          {
            "border-primary-500 bg-primary-500 bg-opacity-10": isDragOver,
          },
        )}
        onDragEnter={() => setIsDragOver(true)}
        onDragLeave={() => setIsDragOver(false)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
      >
        <span
          className={clsx({
            "animate-ping text-primary-500": isDragOver,
          })}
        >
          {isDragOver ? (
            <BsCalendarPlusFill size="2em" />
          ) : (
            <BsCalendarPlus size="2em" />
          )}
        </span>
      </div>
      <ModalPopup
        open={events && events?.length > 0}
        setOpen={() => setEvents([])}
      >
        <MeetingQuickCreate
          projectID={projectID}
          events={events}
          onCreate={() => setEvents([])}
        />
      </ModalPopup>
    </>
  )
}
