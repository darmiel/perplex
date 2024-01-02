import clsx from "clsx"
import { ComponentPropsWithoutRef, ElementType, ReactNode } from "react"

// GlowingCardProps contains the props for the GlowingCard
export type GlowingCardProps<As extends ElementType> = {
  // children is the content of the GlowingCard
  children?: ReactNode
  // classNames is the class names for the GlowingCard
  classNames?: GlowingCardClassNames
  // isSingle is whether the GlowingCard is a single card
  // set this to true if you only have one GlowingCard and don't wrap it in GlowingCards
  isSingle?: boolean
  // as is the element type for the GlowingCard
  as?: As
} & Omit<ComponentPropsWithoutRef<As>, "as" | "onMouseMove">

export default function GlowingCard<As extends ElementType>(
  props: GlowingCardProps<As>,
) {
  const {
    as: Component = "div",
    classNames,
    isSingle,
    children,
    ...rest
  } = props
  return (
    <Component
      className={clsx(
        "glowing-card flex",
        // container class names
        classNames?.container ?? defaultClassNames.container,
        {
          // if the card is single, then we want to show the glow (inner gradient) effect on hover
          // otherwise, this is handled by the css rule for the parent container
          "hover:after:opacity-100": isSingle,
        },
      )}
      onMouseMove={isSingle ? onMouseMove : undefined}
      {...rest}
    >
      <div
        className={clsx(
          "glowing-card-content",
          // content class names
          classNames?.content ?? defaultClassNames.content,
        )}
      >
        {children}
      </div>
    </Component>
  )
}

// GlowingCardClassNames contains the class names for the GlowingCard
type GlowingCardClassNames = {
  container?: string
  content?: string
}

// defaultClassNames is the default class names for the GlowingCard
const defaultClassNames: GlowingCardClassNames = {
  container: "",
  content: "space-y-4 bg-neutral-950 p-4",
} as const

// onMouseMove is the mouse move event handler for the GlowingCard
// It sets the CSS variables for the mouse position (relative to the card)
const onMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
  const { clientX, clientY } = event
  const { left, top } = event.currentTarget.getBoundingClientRect()
  event.currentTarget.style.setProperty("--mouse-x", `${clientX - left}px`)
  event.currentTarget.style.setProperty("--mouse-y", `${clientY - top}px`)
}
