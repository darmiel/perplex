import { PropsWithChildren } from "react"
import { ClipLoader } from "react-spinners"

const buttonStyles = {
  primary: "bg-primary-500 hover:bg-primary-600",
  secondary: "border border-primary-600 hover:bg-primary-800",
  neutral: "border border-neutral-700 bg-neutral-900 hover:bg-neutral-950",
} as const

const stateStyle = {
  disabled: "opacity-50 cursor-not-allowed",
  active: "cursor-pointer",
}

export type ButtonStyle = keyof typeof buttonStyles

type ButtonProps = {
  style?: ButtonStyle
  isLoading?: boolean
  onClick?: () => void
  disabled?: boolean
  className?: string
} & PropsWithChildren

export default function Button({
  style = "neutral",
  isLoading = false,
  onClick,
  disabled,
  className = "",
  children,
}: ButtonProps) {
  const isDisabled = disabled || isLoading

  // base styling
  const classNames = ["px-4 py-2 text-center rounded-md"]
  // button style
  classNames.push(buttonStyles[style])
  // enable / disabled state styling
  classNames.push(isDisabled ? stateStyle.disabled : stateStyle.active)
  // user styling
  className && classNames.push(className)

  return (
    <button
      disabled={isDisabled}
      className={classNames.join(" ")}
      onClick={() => onClick?.()}
    >
      {isLoading ? (
        <div className="flex flex-row items-center justify-center space-x-2">
          <div>
            <ClipLoader color="white" size={16} />
          </div>
          <div>{children}</div>
        </div>
      ) : (
        children
      )}
    </button>
  )
}
