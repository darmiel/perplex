import clsx from "clsx"
import { ReactNode } from "react"

// GlowingModalCardProps contains the props for the GlowingModalCard
export type GlowingModalCardProps = {
  // children is the content of the GlowingModalCard
  children: ReactNode
  // classNames is the class names for the GlowingModalCard
  classNames?: GlowingModalCardClassNames
  // onClick is the click event handler for the GlowingModalCard
  onClick?: () => void
}

export default function GlowingModalCard({
  children,
  classNames,
  onClick,
}: GlowingModalCardProps) {
  const containerClassName =
    classNames?.container ?? defaultClassNames.container
  const contentClassName = classNames?.content ?? defaultClassNames.content
  return (
    <div
      className={clsx(containerClassName, "glowing-card", {
        "cursor-pointer": !!onClick,
      })}
      onMouseMove={onMouseMove}
      onClick={onClick}
    >
      <div className={clsx("glowing-card-content", contentClassName)}>
        {children}
      </div>
    </div>
  )
}

// GlowingModalCardClassNames contains the class names for the GlowingModalCard
type GlowingModalCardClassNames = {
  container?: string
  content?: string
}

// defaultClassNames is the default class names for the GlowingModalCard
const defaultClassNames: GlowingModalCardClassNames = {
  container: "h-fit w-1/2 min-w-fit",
  content: "space-y-4 bg-neutral-950 p-4",
} as const

// onMouseMove is the mouse move event handler for the GlowingModalCard
// It sets the CSS variables for the mouse position (relative to the card)
const onMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
  const { clientX, clientY } = event
  const { left, top } = event.currentTarget.getBoundingClientRect()
  event.currentTarget.style.setProperty("--mouse-x", `${clientX - left}px`)
  event.currentTarget.style.setProperty("--mouse-y", `${clientY - top}px`)
}
