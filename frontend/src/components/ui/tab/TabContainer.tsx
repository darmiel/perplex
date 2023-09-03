import { ReactNode } from "react"

import Button from "@/components/ui/Button"

type ExtendedTabItem = {
  name: string
  icon?: JSX.Element
}

export default function TabContainer({
  tab,
  setTab,
  panes,
  injectHeader,
  children,
}: {
  tab: string
  setTab: (tab: string) => void
  panes: readonly ExtendedTabItem[]
  injectHeader?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex max-h-screen w-full flex-col">
      <div className="w-full border-b border-b-neutral-700 bg-neutral-950 px-4 py-2">
        {panes.map((item, key) => (
          <Button
            key={key}
            style={tab === item.name ? "tab-active" : "tab"}
            onClick={() => tab !== item.name && setTab(item.name)}
            icon={item.icon}
          >
            {item.name}
          </Button>
        ))}
        {injectHeader}
      </div>
      {children}
    </div>
  )
}
