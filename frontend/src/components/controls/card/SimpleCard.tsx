import { PropsWithChildren, ReactNode } from "react"
import CardContainer, {
  CardContainerProps,
} from "@/components/controls/card/CardContainer"

export type SimpleCardProps = {
  title: ReactNode | string
  subtitle?: ReactNode | string
} & CardContainerProps

export type CardTitleProps = PropsWithChildren<{
  active?: boolean
  className?: string
  truncate?: number
}>

export function truncateChildren(
  truncate: number,
  children: ReactNode | string,
): ReactNode | string {
  if (
    truncate > 0 &&
    typeof children === "string" &&
    children.length > truncate
  ) {
    return `${children.substring(0, truncate - 3)}...`
  }
  return children
}

export function CardTitle({
  children,
  active = false,
  className = "",
  truncate = 0,
}: CardTitleProps) {
  return (
    <h1
      className={`font-semibold text-gray-${!active ? 500 : 100} ${className}`}
    >
      {truncateChildren(truncate, children)}
    </h1>
  )
}

export function CardSubTitle({
  children,
  active = false,
  className = "",
  truncate = 0,
}: CardTitleProps) {
  return (
    <span
      className={`text-gray-${
        !active ? 400 : 100
      } text-xs font-normal leading-tight ${className}`}
    >
      {truncateChildren(truncate, children)}
    </span>
  )
}

export default function SimpleCard({
  title,
  subtitle,
  truncateTitle = 0,
  truncateSubtitle = 0,
  active = false,
  onClick,
}: SimpleCardProps & {
  truncateTitle?: number
  truncateSubtitle?: number
}) {
  return (
    <CardContainer active={active} onClick={onClick}>
      <CardTitle truncate={truncateTitle}>{title}</CardTitle>
      <CardSubTitle truncate={truncateSubtitle}>{subtitle}</CardSubTitle>
    </CardContainer>
  )
}
