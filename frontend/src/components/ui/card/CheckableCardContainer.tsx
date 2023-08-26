import { BsCheckCircleFill, BsCircle } from "react-icons/bs"
import { ClipLoader } from "react-spinners"

import CardContainer, {
  CardContainerProps,
} from "@/components/ui/card/CardContainer"

export type CheckableCardContainerProps = CardContainerProps & {
  // if checked is true, checkedIcon will be displayed
  // if checked is false, uncheckedIcon will be displayed
  checked?: boolean
  // if disabled is true, onToggle will not be called when the user clicks on the check icon
  disabled?: boolean
  // if loading is true, it will display a loading icon and disable the check icon
  loading?: boolean
  // if overwriteIcon is set, it will be displayed instead of checkedIcon and uncheckedIcon
  overwriteIcon?: JSX.Element | false
  // checkedIcon is displayed when checked is true
  checkedIcon?: JSX.Element
  // uncheckedIcon is displayed when checked is false
  uncheckedIcon?: JSX.Element
  // onToggle will be called when the user clicks on the check icon
  onToggle?: (toggled: boolean) => void
}

export function CheckableCardContainer({
  // CheckableCardContainerProps
  checked = false,
  disabled = false,
  loading = false,
  overwriteIcon,
  checkedIcon = <BsCheckCircleFill color="lime" size="1.3em" />,
  uncheckedIcon = <BsCircle color="gray" size="1.3em" />,
  onToggle,
  // CardContainerProps
  style = "neutral",
  className = "",
  onClick,
  // PropsWithChildren
  children,
}: CheckableCardContainerProps) {
  const isDisabled = disabled || loading
  return (
    <CardContainer
      style={style}
      onClick={onClick}
      className={`flex items-center ${className}`}
    >
      {/* Display CheckBox Icon */}
      <div
        className={`h-full ${
          isDisabled ? "cursor-not-allowed" : "cursor-pointer"
        }`}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation() // don't run onClick from CardContainer
          !isDisabled && onToggle?.(!checked)
        }}
      >
        {loading ? (
          <ClipLoader color="orange" />
        ) : overwriteIcon ? (
          overwriteIcon
        ) : checked ? (
          checkedIcon
        ) : (
          uncheckedIcon
        )}
      </div>

      {/* Display Title and Description */}
      <div className="ml-3">{children}</div>
    </CardContainer>
  )
}
