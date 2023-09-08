import { Input } from "@nextui-org/react"
import { ReactNode, useState } from "react"
import { BsSearch } from "react-icons/bs"
import { BarLoader } from "react-spinners"

import { Action, Project } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import ActionCardLarge from "@/components/action/cards/ActionCardLarge"
import ActionPeekModal from "@/components/action/modals/ActionItemPeek"
import BadgeHeader from "@/components/ui/BadgeHeader"
import Flex from "@/components/ui/layout/Flex"
import ModalPopup from "@/components/ui/modal/ModalPopup"
import { useAuth } from "@/contexts/AuthContext"

export default function ActionGrid({
  projectID,
  openOnly = true,
  slots,
}: {
  projectID?: number
  openOnly?: boolean
  slots?: ReactNode
}) {
  const [filter, setFilter] = useState("")
  const [showActionPeek, setShowActionPeek] = useState(false)
  const [actionPeekItem, setActionPeekItem] = useState<Action | null>(null)

  const title = projectID
    ? openOnly
      ? "Open Actions"
      : "Actions"
    : openOnly
    ? "Open Actions Assigned to You"
    : "Actions Assigned to You"

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
      <Flex x={4}>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {slots}
      </Flex>
      <Input
        variant="bordered"
        value={filter}
        onValueChange={setFilter}
        startContent={<BsSearch />}
        placeholder={`Search in Topics...`}
        width="100%"
      />

      {/* Quick Peek Action */}
      <ModalPopup
        open={showActionPeek && !!actionPeekItem}
        setOpen={setShowActionPeek}
      >
        <ActionPeekModal
          action={actionPeekItem!}
          onClose={() => {
            setShowActionPeek(false)
          }}
        />
      </ModalPopup>

      <div className="flex w-full flex-col space-y-2">
        {projects.map((project) => (
          <DashboardProjectItemActions
            key={project.ID}
            project={project}
            onActionClick={(action) => {
              setActionPeekItem(action)
              setShowActionPeek(true)
            }}
            filter={filter}
            openOnly={openOnly}
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
}: {
  project: Project
  filter: string
  onActionClick: (action: Action) => void
  openOnly?: boolean
}) {
  const { actions } = useAuth()
  const actionListQuery = actions!.useListForMe(project.ID, openOnly)
  if (actionListQuery.isLoading) {
    return <BarLoader />
  }
  if (actionListQuery.isError) {
    return (
      <>Error loading actions: {extractErrorMessage(actionListQuery.error)}</>
    )
  }
  const filteredActions = actionListQuery.data.data.filter(
    (action) =>
      !filter ||
      action.title.toLowerCase().includes(filter.toLowerCase()) ||
      action.description.toLowerCase().includes(filter.toLowerCase()),
  )
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
