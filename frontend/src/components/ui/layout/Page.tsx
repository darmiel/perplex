import { PropsWithChildren } from "react"

export default function Page({ children }: PropsWithChildren) {
  return (
    <main className="h-fit min-h-full w-full bg-neutral-950 p-10">
      {children}
    </main>
  )
}
