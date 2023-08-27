import { ReactNode } from "react"

export default function ModalContainer({
  children,
  title,
  className = "",
}: {
  children: ReactNode
  title?: string
  className?: string
}) {
  return (
    <div
      className={`bg-neutral-900 border border-neutral-700 rounded-lg p-10 space-y-8 ${className}`}
    >
      {title && <h1 className="text-2xl font-bold">{title}</h1>}
      {children}
    </div>
  )
}
