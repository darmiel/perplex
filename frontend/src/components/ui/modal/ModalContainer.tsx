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
      className={`space-y-8 rounded-lg border border-neutral-700 bg-neutral-900 p-10 ${className}`}
    >
      {title && <h1 className="text-2xl font-bold">{title}</h1>}
      {children}
    </div>
  )
}
