import { PropsWithChildren } from "react"

export default function OverviewSide({
  className = "w-full md:w-80",
  children,
}: PropsWithChildren<{ className?: string }>) {
  return <div className={`${className} space-y-4`}>{children}</div>
}
