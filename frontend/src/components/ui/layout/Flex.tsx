export default function Flex({
  span = false,
  col = false,
  gap,
  x,
  y,
  justify,
  children,
  className,
  onClick,
}: {
  x?: number
  y?: number
  gap?: number
  span?: boolean
  col?: boolean
  justify?: "start" | "end" | "center" | "between" | "around" | "evenly"
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  const classNames = ["flex"]
  gap !== undefined && classNames.push(`gap-${gap}`)
  justify && classNames.push(`justify-${justify}`)
  col ? classNames.push("flex-col") : classNames.push("items-center")
  x !== undefined && classNames.push(`space-x-${x}`)
  y !== undefined && classNames.push(`space-y-${y}`)
  className && classNames.push(className)
  return span ? (
    <span className={classNames.join(" ")} onClick={onClick}>
      {children}
    </span>
  ) : (
    <div className={classNames.join(" ")} onClick={onClick}>
      {children}
    </div>
  )
}
