import { PropsWithChildren } from "react"

export default function OverviewSide({ children }: PropsWithChildren) {
  return <div className="w-2/12 space-y-4">{children}</div>
}
