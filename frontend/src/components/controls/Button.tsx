export default function Button({
  onClick,
  children,
}: React.PropsWithChildren<{ onClick?: () => void }>) {
  return (
    <div
      className="border border-neutral-600 px-4 py-2 text-center hover:bg-neutral-900 hover:cursor-pointer"
      onClick={() => onClick?.()}
    >
      {children}
    </div>
  )
}
