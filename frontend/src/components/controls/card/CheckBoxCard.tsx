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

export function SimpleCheckBoxCard({
  children,
  active = false,
  checked = false,
  disabled = false,
  loading = false,
  overwriteIcon,
  checkedIcon = <BsCheckCircleFill color="lime" size="1.3em" />,
  uncheckedIcon = <BsCircle color="gray" size="1.3em" />,
  className,
  onClick,
  onToggle,
}: {
  children: React.ReactNode
  active?: boolean
  checked?: boolean
  disabled?: boolean
  loading?: boolean
  overwriteIcon?: JSX.Element | false
  checkedIcon?: JSX.Element
  uncheckedIcon?: JSX.Element
  className?: string
  onClick?: () => void
  onToggle?: (toggled: boolean) => void
}) {
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
      <div className="ml-3">{children}</div>
    </CardContainer>
  )
}

export default function CheckBoxCard(props: CheckBoxCardProps) {
  return (
    <SimpleCheckBoxCard {...props}>
      <CardTitle truncate={props.truncateTitle} active={!props.checked}>
        {props.title}
      </CardTitle>
      <CardSubTitle truncate={props.truncateSubTitle} active={!props.checked}>
        {props.subtitle}
      </CardSubTitle>
    </SimpleCheckBoxCard>
  )
}
