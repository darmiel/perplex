import { useRouter } from "next/router"
import { ReactNode } from "react"
import { BarLoader } from "react-spinners"

import { Action, Project } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import ActionCardLarge from "@/components/action/cards/ActionCardLarge"
import BadgeHeader from "@/components/ui/BadgeHeader"
import useSearch from "@/components/ui/SearchBar"
import { useAuth } from "@/contexts/AuthContext"

export default function ActionGrid({
  projectID,
  openOnly = true,
  meOnly = true,
  slots,
}: {
  projectID?: number
  openOnly?: boolean
  meOnly?: boolean
  slots?: ReactNode
}) {
  const router = useRouter()
  const { component: SearchBar, filter: searchFilter } = useSearch<Action>(
    (action) => action.title,
  )

  const title =
    (openOnly ? "Open " : "") + (meOnly ? "Actions Assigned to You" : "Actions")

  const { projects: projectsDB } = useAuth()

  const projectListQuery = projectID
    ? projectsDB!.useFind(projectID)
    : projectsDB!.useList()

  if (projectListQuery.isLoading) {
    return <BarLoader />
  }
  if (projectListQuery.isError) {
    return (
      <>Error loading projects: {extractErrorMessage(projectListQuery.error)}</>
    )
  }

  const projects = projectID
    ? ([projectListQuery.data.data] as Project[])
    : (projectListQuery.data.data as Project[])

  return (
    <section className="space-y-4">
      <h1 className="flex items-center space-x-2">
        <span className="text-xl font-semibold">{title}</span>
        {slots}
      </h1>
      {SearchBar}

      <div className="flex w-full flex-col space-y-2">
        {projects.map((project) => (
          <DashboardProjectItemActions
            key={project.ID}
            project={project}
            onActionClick={(action) => {
              router.push(`/project/${action.project_id}/action/${action.ID}`)
            }}
            filter={searchFilter}
            openOnly={openOnly}
            meOnly={meOnly}
          />
        ))}
      </div>
    </section>
  )
}

function DashboardProjectItemActions({
  project,
  filter,
  onActionClick,
  openOnly = true,
  meOnly = true,
}: {
  project: Project
  filter: (action: Action) => boolean
  onActionClick: (action: Action) => void
  openOnly?: boolean
  meOnly?: boolean
}) {
  const { actions } = useAuth()
  const actionListQuery = meOnly
    ? actions!.useListForMe(project.ID, openOnly)
    : actions!.useListForProject(project.ID)

  if (actionListQuery.isLoading) {
    return <BarLoader />
  }
  if (actionListQuery.isError) {
    return (
      <>Error loading actions: {extractErrorMessage(actionListQuery.error)}</>
    )
  }
  const filteredActions = actionListQuery.data.data
    .filter((action) => !openOnly || !action.closed_at.Valid)
    .filter(filter)

  if (filteredActions.length === 0) {
    return undefined
  }
  return (
    <>
      <BadgeHeader title={project.name} badge={filteredActions.length} />
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredActions.map((action) => (
          <ActionCardLarge
            key={action.ID}
            onClick={() => onActionClick(action)}
            action={action}
          />
        ))}
      </div>
    </>
  )
}
