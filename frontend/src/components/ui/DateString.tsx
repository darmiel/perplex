export default function DateString({
  value,
  date = false,
  time = false,
  at = "at",
}: {
  value: Date | null | undefined
  date?: boolean
  time?: boolean
  at?: string
}) {
  const response: string[] = []
  if (date) {
    response.push(value?.toLocaleDateString() ?? "Unknown Date")
    if (time) response.push(at)
  }
  if (time) response.push(value?.toLocaleTimeString() ?? "Unknown Time")
  return <>{response.join(" ")}</>
}
