import { PropsWithChildren, ReactNode } from "react"

import Flex from "@/components/ui/layout/Flex"

export default function OverviewSection({
  name,
  badge = undefined,
  endContent,
  children,
}: PropsWithChildren<{ name: string; badge?: any; endContent?: ReactNode }>) {
  return (
    <section className="flex flex-col space-y-2">
      <Flex
        justify="between"
        className="text-sm font-semibold text-neutral-500"
      >
        <Flex gap={2}>
          <h3>{name}</h3>
          {badge !== undefined && (
            <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-700 text-xs font-normal text-white">
              {badge}
            </div>
          )}
        </Flex>
        {endContent}
      </Flex>
      <div>{children}</div>
      <div>
        <hr className="mt-2 border-gray-700" />
      </div>
    </section>
  )
}
