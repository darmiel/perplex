import clsx from "clsx"

function simplifyMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"}`
  }
  if (minutes < 60 * 24) {
    const hours = Math.floor(minutes / 60)
    return `${hours} hour${hours === 1 ? "" : "s"}`
  }
  const days = Math.floor(minutes / 60 / 24)
  return `${days} day${days === 1 ? "" : "s"}`
}

export default function DurationTag({
  date,
  textOnly,
}: {
  date: Date
  textOnly?: boolean
}) {
  const timeRemaining = Math.floor((date.getTime() - Date.now()) / 1000 / 60)

  let timeString = ""
  let className = ""

  const classNames = ["w-fit text-xs", !textOnly && "px-2 py-1"]

  if (timeRemaining < 0) {
    timeString = `${simplifyMinutes(Math.abs(timeRemaining))} ago`
    classNames.push("border-orange-500 text-orange")
    !textOnly && classNames.push("border")
  } else {
    timeString = `in ${simplifyMinutes(timeRemaining)}`

    if (timeRemaining < 60) {
      // less than 60 minutes left
      classNames.push("bg-blue-500 text-white")
    } else if (timeRemaining < 60 * 24) {
      // less than 24 hours left
      classNames.push("border-blue-500 text-blue-500")
      !textOnly && classNames.push("border")
    } else if (timeRemaining < 60 * 24 * 7) {
      // less than 7 days left
      classNames.push("border-neutral-500 text-neutral-500")
      !textOnly && classNames.push("border")
    } else {
      return <></>
    }
  }

  return <span className={clsx(...classNames)}>{timeString}</span>
}
