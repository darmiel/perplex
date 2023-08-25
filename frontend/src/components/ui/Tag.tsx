import { ReactNode } from "react"

export default function Tag({
  className = "bg-green-600 text-white",
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={`rounded-full text-sm ${className} px-3 py-1 flex flex-row items-center space-x-1`}
    >
      {children}
    </div>
  )
}
