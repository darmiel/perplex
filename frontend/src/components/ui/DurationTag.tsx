function simplifyMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minutes`
  }
  if (minutes < 60 * 24) {
    return `${Math.floor(minutes / 60)} hours`
  }
  return `${Math.floor(minutes / 60 / 24)} days`
}

export default function DurationTag({ date }: { date: Date }) {
  const timeRemaining = Math.floor((date.getTime() - Date.now()) / 1000 / 60)

  let timeString = ""
  let className = ""

  if (timeRemaining < 0) {
    timeString = `${simplifyMinutes(Math.abs(timeRemaining))} ago`
    className = "border border-orange-500 text-orange-500"
  } else {
    timeString = `in ${simplifyMinutes(timeRemaining)}`

    if (timeRemaining < 60) {
      className = "bg-blue-500 text-white"
    } else if (timeRemaining < 60 * 24) {
      className = "border border-blue-500 text-neutral-200"
    } else if (timeRemaining < 60 * 24 * 7) {
      className = "border border-neutral-500 text-neutral-500"
    } else {
      return <></>
    }
  }

  return (
    <span className={`w-fit px-2 py-1 text-xs ${className}`}>{timeString}</span>
  )
}
