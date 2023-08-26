import { PropsWithChildren } from "react"
import { ClipLoader } from "react-spinners"

const buttonStyles = {
  primary: "bg-primary-500 hover:bg-primary-600 rounded-md",
  secondary: "border border-primary-600 hover:bg-primary-800 rounded-md",
  neutral:
    "border border-neutral-700 bg-neutral-900 hover:bg-neutral-950 rounded-md",
  tab: "border-b-2 border-transparent hover:border-primary-500",
  "tab-active": "border-b-2 border-primary-500",
} as const

const stateStyle = {
  disabled: "opacity-50 cursor-not-allowed",
  active: "cursor-pointer",
}

export type ButtonStyle = keyof typeof buttonStyles

type ButtonProps = {
  style?: ButtonStyle
  icon?: JSX.Element
  isLoading?: boolean
  onClick?: () => void
  disabled?: boolean
  className?: string
  raw?: boolean
} & PropsWithChildren

export default function Button({
  style = "neutral",
  icon,
  isLoading = false,
  onClick,
  disabled,
  className = "",
  raw = false,
  children,
}: ButtonProps) {
  const isDisabled = disabled || isLoading

  // base styling
  const classNames = ["px-4 py-2 text-center"]
  // button style
  classNames.push(buttonStyles[style])
  // enable / disabled state styling
  classNames.push(isDisabled ? stateStyle.disabled : stateStyle.active)
  // user styling
  className && classNames.push(className)

  const iconContent = isLoading ? <ClipLoader color="white" size={16} /> : icon
  const buttonContent = iconContent ? (
    <div className="flex flex-row items-center justify-center space-x-2">
      <div>{iconContent}</div>
      <div>{children}</div>
    </div>
  ) : (
    children
  )

  return raw ? (
    <div className={classNames.join(" ")} onClick={() => onClick?.()}>
      {buttonContent}
    </div>
  ) : (
    <button
      disabled={isDisabled}
      className={classNames.join(" ")}
      onClick={() => onClick?.()}
    >
      {buttonContent}
    </button>
  )
}
