import { PropsWithChildren } from "react"

export default function OverviewSection({
  name,
  badge = undefined,
  children,
}: PropsWithChildren<{ name: string; badge?: any }>) {
  return (
    <div className="flex flex-col space-y-2">
      <div>
        <h3 className="font-semibold text-sm text-neutral-500 flex items-center space-x-2">
          <span>{name}</span>
          {badge !== undefined && (
            <div className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-neutral-700 rounded-full">
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
