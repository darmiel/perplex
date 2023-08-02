const classNames = {
  active: "border-neutral-500 bg-neutral-800",
  inactive: "bg-neutral-900 border-neutral-600 cursor-pointer",
}

export default function TopicCard({
  title,
  description,
  active,
  onClick,
}: {
  title: string
  description: string
  active?: boolean
  onClick?: () => void
}) {
  const id = `checkbox-${Math.round(Math.random() * 1000000)}`
  return (
    <li
      className={`${
        active ? classNames.active : classNames.inactive
      } flex border p-4 rounded-lg items-center`}
      onClick={() => {
        !active && onClick && onClick()
      }}
    >
      <div className="h-5">
        <input
          id={id}
          aria-describedby="helper-checkbox-text"
          type="checkbox"
          value=""
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-600 ring-offset-gray-800 focus:ring-2 bg-gray-700 border-gray-600"
        />
      </div>
      <div className="ml-4 text-l">
        <label htmlFor={id} className={`font-semibold text-gray-100`}>
          {title}
        </label>
        <p
          className={`${
            active ? "text-gray-100" : "text-gray-400"
          } text-xs font-normal`}
        >
          {description.length > 32
            ? `${description.substring(0, 29)}...`
            : description}
        </p>
      </div>
    </li>
  )
}
