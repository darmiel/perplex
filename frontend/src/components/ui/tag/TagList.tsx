import { PropsWithChildren } from "react"

export default function TagList({
  children,
  noWrap = false,
}: PropsWithChildren<{
  noWrap?: boolean
}>) {
  return (
    <div className={`flex ${noWrap ? "flex-nowrap" : "flex-wrap"} gap-2`}>
      {children}
    </div>
  )
}
