import { PropsWithChildren } from "react"

const cardStyle = {
  neutral: "bg-neutral-900 border border-neutral-700",
  selected: "border-neutral-500 bg-neutral-900",
  "selected-border": "border border-primary-600",
} as const

export type CardContainerStype = keyof typeof cardStyle

export type CardContainerProps = {
  style?: CardContainerStype
  className?: string
  onClick?: () => void
} & PropsWithChildren

export default function CardContainer({
  style = "neutral",
  onClick,
  className = "",
  children,
}: CardContainerProps) {
  // base classes
  const classNames = ["px-4 py-2 border relative rounded-md"]
  // card style
  classNames.push(cardStyle[style])
  // pointer style
  onClick && classNames.push("cursor-pointer")
  // user style
  className && classNames.push(className)

  return (
    <div className={classNames.join(" ")} onClick={() => onClick?.()}>
      {children}
    </div>
  )
}
