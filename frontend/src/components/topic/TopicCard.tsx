import Link from "next/link"

const classNames = {
  active: "border-neutral-500 bg-neutral-800",
  inactive: "bg-neutral-900 border-neutral-600 cursor-pointer",
}

export default function TopicCard({
  title,
  description,
  active,
  checked,
  link,
  onToggle,
}: {
  title: string
  description: string
  active?: boolean
  checked: boolean
  link: string
  onToggle?: (toggled: boolean) => void
}) {
  return (
    <Link href={link}>
      <li
        className={`${
          active ? classNames.active : classNames.inactive
        } flex border p-4 rounded-lg items-center`}
      >
        <div className="h-5">
          <input
            aria-describedby="helper-checkbox-text"
            type="checkbox"
            onChange={(e) => onToggle?.(e.target.checked)}
            value=""
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-600 ring-offset-gray-800 focus:ring-2 bg-gray-700 border-gray-600"
            checked={checked}
          />
        </div>
        <div className="ml-4 text-l">
          <span className={`font-semibold text-gray-100`}>{title}</span>
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
    </Link>
  )
}
