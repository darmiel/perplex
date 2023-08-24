import { BsCheckCircleFill, BsCircle } from "react-icons/bs"
import { ClipLoader } from "react-spinners"

import CardContainer from "./CardContainer"
import { CardSubTitle, CardTitle, SimpleCardProps } from "./SimpleCard"

export type CheckBoxCardProps = SimpleCardProps & {
  checked?: boolean
  disabled?: boolean
  loading?: boolean
  truncateTitle?: number
  truncateSubTitle?: number
  onToggle?: (toggled: boolean) => void
  overwriteIcon?: JSX.Element
  checkedIcon?: JSX.Element
  uncheckedIcon?: JSX.Element
}

export default function CheckBoxCard({
  title,
  subtitle,
  checked = false,
  disabled = false,
  loading = false,
  overwriteIcon,
  checkedIcon = <BsCheckCircleFill color="lime" size="1.3em" />,
  uncheckedIcon = <BsCircle color="gray" size="1.3em" />,
  truncateTitle = 0,
  truncateSubTitle = 0,
  active = false,
  className,
  onClick,
  onToggle,
}: CheckBoxCardProps) {
  let icon: JSX.Element
  if (loading) {
    icon = <ClipLoader color="orange" />
  } else if (overwriteIcon) {
    icon = overwriteIcon
  } else {
    icon = checked ? checkedIcon : uncheckedIcon
  }

  return (
    <CardContainer
      active={active}
      onClick={onClick}
      className={`flex items-center ${className}`}
    >
      {/* Display CheckBox */}
      <div
        className="h-full"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          !disabled && onToggle?.(!checked)
        }}
      >
        {icon}
      </div>

      {/* Display Title and Description */}
      <div className="ml-3">
        <CardTitle truncate={truncateTitle} active={!checked}>
          {title}
        </CardTitle>
        <CardSubTitle truncate={truncateSubTitle} active={!checked}>
          {subtitle}
        </CardSubTitle>
      </div>
    </CardContainer>
  )
}
