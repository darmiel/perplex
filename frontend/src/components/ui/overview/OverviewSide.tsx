import { PropsWithChildren } from "react"

export default function OverviewSide({
  className = "w-2/12",
  children,
}: PropsWithChildren<{ className?: string }>) {
  return <div className={`${className} space-y-4`}>{children}</div>
}
