import clsx from "clsx"
import { ReactNode } from "react"

export default function GlowingCards({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section
      onMouseMove={(event) => {
        // get all cards inside the section
        event.currentTarget
          .querySelectorAll(".glowing-card")
          .forEach((_card) => {
            if (!(_card instanceof HTMLElement)) return
            const card = _card as HTMLElement // making IDEs happy :)

            const { clientX, clientY } = event
            const { left, top } = card.getBoundingClientRect()
            card.style.setProperty("--mouse-x", `${clientX - left}px`)
            card.style.setProperty("--mouse-y", `${clientY - top}px`)
          })
      }}
      className={clsx("glowing-card-container", className)}
    >
      {children}
    </section>
  )
}
