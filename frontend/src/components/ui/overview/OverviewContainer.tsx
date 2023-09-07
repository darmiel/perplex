import { PropsWithChildren } from "react"

export default function OverviewContainer({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`flex w-full flex-col gap-6 md:flex-row ${className}`}>
      {children}
    </div>
  )
}
