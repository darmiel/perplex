import Link from "next/link"
import { BsCircle, BsCheckCircleFill } from "react-icons/bs"

const classNames = {
  active: "border-neutral-500 bg-neutral-800 hover:bg-neutral-700",
  inactive:
    "border-neutral-600 cursor-pointer bg-neutral-900 hover:bg-neutral-800",
}

export default function TopicCard({
  title,
  description,
  active,
  checked,
  link,
  className = "",
  onToggle,
}: {
  title: string
  description: string
  active?: boolean
  checked: boolean
  link: string
  className?: string
  onToggle?: (toggled: boolean) => void
}) {
  return (
    <Link href={link} className={className}>
      <li
        className={`${
          active ? classNames.active : classNames.inactive
        } flex border py-4 px-5 rounded-lg items-center`}
      >
        <div className="h-full">
          {checked ? (
            <BsCheckCircleFill color="lime" size="1.3em" />
          ) : (
            <BsCircle color="gray" size="1.3em" />
          )}
        </div>
        <div className="ml-4 text-l">
          <span className={`font-semibold text-gray-${checked ? 500 : 100}`}>
            {title}
          </span>
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
