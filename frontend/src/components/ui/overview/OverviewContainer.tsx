import { PropsWithChildren } from "react"

export default function OverviewContainer({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`flex flex-row w-full space-x-6 ${className}`}>
      {children}
    </div>
  )
}
