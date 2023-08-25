import { ReactNode } from "react"

export default function ModalContainer({
  children,
  title,
}: {
  children: ReactNode
  title: string
}) {
  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-10 w-full space-y-8">
      <h1 className="text-2xl font-bold">{title}</h1>
      {children}
    </div>
  )
}
