import { PropsWithChildren, ReactNode } from "react"

type TruncateTitleProps = PropsWithChildren<{
  active?: boolean
  className?: string
  truncate?: number
}>

export function truncateChildren(
  truncate: number,
  children: ReactNode | string,
): ReactNode | string {
  if (
    truncate > 0 &&
    typeof children === "string" &&
    children.length > truncate
  ) {
    return `${children.substring(0, truncate - 3)}...`
  }
  return children
}

export function TruncateTitle({
  children,
  active = true,
  className = "",
  truncate = 0,
}: TruncateTitleProps) {
  return (
    <h1
      className={`font-semibold text-gray-${!active ? 500 : 100} ${className}`}
    >
      {truncateChildren(truncate, children)}
    </h1>
  )
}

export function TruncateSubTitle({
  children,
  active = false,
  className = "",
  truncate = 0,
}: TruncateTitleProps) {
  return (
    <span
      className={`text-gray-${
        !active ? 500 : 400
      } text-xs font-normal leading-tight ${className}`}
    >
      {truncateChildren(truncate, children)}
    </span>
  )
}
