export default function Flex({
  span = false,
  col = false,
  gap,
  x,
  y,
  justify,
  children,
  className,
}: {
  x?: number
  y?: number
  gap?: number
  span?: boolean
  col?: boolean
  justify?: "start" | "end" | "center" | "between" | "around" | "evenly"
  children: React.ReactNode
  className?: string
}) {
  const classNames = ["flex items-center"]
  gap !== undefined && classNames.push(`gap-${gap}`)
  justify && classNames.push(`justify-${justify}`)
  col && classNames.push("flex-col")
  x !== undefined && classNames.push(`space-x-${x}`)
  y !== undefined && classNames.push(`space-y-${y}`)
  className && classNames.push(className)
  return span ? (
    <span className={classNames.join(" ")}>{children}</span>
  ) : (
    <div className={classNames.join(" ")}>{children}</div>
  )
}
