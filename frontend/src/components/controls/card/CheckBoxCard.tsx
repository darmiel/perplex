import { title } from "process"
import { BsCheckCircleFill, BsCircle } from "react-icons/bs"
import CardContainer from "./CardContainer"
import SimpleCard, {
  CardSubTitle,
  CardTitle,
  SimpleCardProps,
} from "./SimpleCard"
import { BeatLoader, BounceLoader, ClipLoader } from "react-spinners"

export type CheckBoxCardProps = SimpleCardProps & {
  checked?: boolean
  disabled?: boolean
  loading?: boolean
  truncateTitle?: number
  truncateSubTitle?: number
  onToggle?: (toggled: boolean) => void
  icon?: JSX.Element
}

export default function CheckBoxCard({
  title,
  subtitle,
  checked = false,
  disabled = false,
  loading = false,
  icon,
  truncateTitle = 0,
  truncateSubTitle = 0,
  active = false,
  className,
  onClick,
  onToggle,
}: CheckBoxCardProps) {
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
        {loading ? (
          <ClipLoader color="orange" />
        ) : icon ? (
          icon
        ) : checked ? (
          <BsCheckCircleFill color="lime" size="1.3em" />
        ) : (
          <BsCircle color="gray" size="1.3em" />
        )}
      </div>

      {/* Display Title and Description */}
      <div className="ml-3">
        <CardTitle truncate={truncateTitle}>{title}</CardTitle>
        <CardSubTitle truncate={truncateSubTitle}>{subtitle}</CardSubTitle>
      </div>
    </CardContainer>
  )
}
