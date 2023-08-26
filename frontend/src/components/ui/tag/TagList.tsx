import { PropsWithChildren } from "react"

export default function TagList({ children }: PropsWithChildren) {
  return <div className="flex flex-wrap gap-2">{children}</div>
}
