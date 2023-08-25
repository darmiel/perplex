import { PropsWithChildren } from "react"

export default function OverviewSection({
  name,
  children,
}: PropsWithChildren<{ name: string }>) {
  return (
    <div className="flex flex-col space-y-2">
      <div>
        <h3 className="text-sm font-semibold text-neutral-500">{name}</h3>
      </div>
      <div>{children}</div>
      <div>
        <hr className="mt-2 border-gray-700" />
      </div>
    </div>
  )
}
