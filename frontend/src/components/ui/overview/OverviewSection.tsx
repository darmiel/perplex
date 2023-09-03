import { PropsWithChildren } from "react"

export default function OverviewSection({
  name,
  badge = undefined,
  children,
}: PropsWithChildren<{ name: string; badge?: any }>) {
  return (
    <div className="flex flex-col space-y-2">
      <div>
        <h3 className="flex items-center space-x-2 text-sm font-semibold text-neutral-500">
          <span>{name}</span>
          {badge !== undefined && (
            <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-700 text-xs font-bold text-white">
              {badge}
            </div>
          )}
        </h3>
      </div>
      <div>{children}</div>
      <div>
        <hr className="mt-2 border-gray-700" />
      </div>
    </div>
  )
}
