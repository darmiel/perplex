const classNames = {
  active: "border-neutral-500 bg-neutral-800",
  inactive: "bg-neutral-900 border-neutral-600 cursor-pointer",
}

export default function MeetingCard({
  title,
  date,
  active,
  onClick,
}: {
  title: string
  date: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <div
      className={`${
        active ? classNames.active : classNames.inactive
      } px-6 py-4 border relative rounded-md`}
      onClick={() => {
        !active && onClick && onClick()
      }}
    >
      <h1 className="font-semibold text-xl text-gray-200">{title}</h1>
      <span className={active ? "text-neutral-200" : "text-neutral-500"}>
        {date}
      </span>
    </div>
  )
}
