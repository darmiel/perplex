import Link from "next/link"

import { Project } from "@/api/types"
import ResolveUserName from "@/components/resolve/ResolveUserName"
import UserAvatar from "@/components/user/UserAvatar"

export default function SearchResultProject({
  project,
  onClick,
  onMouseOver,
}: {
  project: Project
  onClick: () => void
  onMouseOver: (link: string) => void
}) {
  const href = `/project/${project.ID}`
  return (
    <Link
      href={href}
      key={project.ID}
      className="flex items-center space-x-2 p-2 rounded-md hover:bg-neutral-800"
      onClick={() => onClick()}
      onMouseOver={() => onMouseOver(href)}
    >
      <div className="h-5 w-5">
        <UserAvatar userID={String(project.ID)} />
      </div>
      <div className="flex flex-col">
        <h4 className="text-sm space-x-1">
          <span className="text-white">{project.name}</span>
          <span className="text-neutral-400">
            by <ResolveUserName userID={project.owner_id} />
          </span>
        </h4>
        <p className="text-xs text-neutral-500">{project.description}</p>
      </div>
    </Link>
  )
}
