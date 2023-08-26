export function RelativeDate({ date }: { date: Date }) {
  const today = new Date()

  // count days between dates
  const diffTime = Math.abs(today.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  // check if date is today
  const isToday =
    date?.getDate() === today.getDate() &&
    date?.getMonth() === today.getMonth() &&
    date?.getFullYear() === today.getFullYear()

  // check if date is yesterday
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday =
    date?.getDate() === yesterday.getDate() &&
    date?.getMonth() === yesterday.getMonth() &&
    date?.getFullYear() === yesterday.getFullYear()

  let dateValue: string | boolean = !isToday
  if (isYesterday) {
    dateValue = "Yesterday"
  } else if (diffDays < 7) {
    dateValue = date.toLocaleDateString("en-US", { weekday: "long" })
  }

  return <DateString value={date} date={dateValue} time />
}

export default function DateString({
  value,
  date = false,
  time = false,
  at = "at",
}: {
  value: Date | null | undefined
  date?: boolean | string
  time?: boolean | string
  at?: string
}) {
  const response: string[] = []
  if (date) {
    if (typeof date === "string") {
      response.push(date)
    } else {
      response.push(value?.toLocaleDateString() ?? "Unknown Date")
    }
    if (time) response.push(at)
  }
  if (time) {
    if (typeof time === "string") {
      response.push(time)
    } else {
      response.push(value?.toLocaleTimeString() ?? "Unknown Time")
    }
  }
  return <>{response.join(" ")}</>
}
