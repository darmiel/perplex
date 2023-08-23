import { PropsWithChildren } from "react"

const classNames = {
  active: "border-neutral-500 bg-neutral-800",
  inactive: "bg-neutral-900 border-neutral-600 cursor-pointer",
}

export type CardContainerProps = {
  active?: boolean
  className?: string
  onClick?: () => void
}

export default function CardContainer({
  active = false,
  onClick,
  className = "",
  children,
}: PropsWithChildren<CardContainerProps>) {
  return (
    <div
      className={`${
        active ? classNames.active : classNames.inactive
      } px-4 py-2 border relative rounded-md ${className}`}
      onClick={() => {
        !active && onClick?.()
      }}
    >
      {children}
    </div>
  )
}
