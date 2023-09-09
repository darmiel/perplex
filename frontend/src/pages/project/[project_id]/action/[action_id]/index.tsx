import { useRouter } from "next/router"

import { navigationBorderRight } from "@/api/classes"
import { extractErrorMessage } from "@/api/util"
import ActionList from "@/components/action/ActionList"
import ActionOverview from "@/components/action/ActionOverview"
import { useAuth } from "@/contexts/AuthContext"

export default function ActionPage() {
  const router = useRouter()
  const { project_id: projectID, action_id: actionID } = router.query

  const { actions } = useAuth()
  const findActionQuery = actions!.useFind(Number(projectID), Number(actionID))

  if (
    !projectID ||
    !actionID ||
    Array.isArray(projectID) ||
    Array.isArray(actionID)
  ) {
    return <>Invalid URL</>
  }

  if (findActionQuery.isLoading) {
    return <>Loading Action...</>
  }
  if (findActionQuery.isError) {
    return (
      <>
        Error: <pre>{extractErrorMessage(findActionQuery.error)}</pre>
      </>
    )
  }

  const projectIDNum = Number(projectID)
  const actionIDNum = Number(actionID)

  return (
    <>
      <div
        className={`${navigationBorderRight} w-[20rem] flex-initial space-y-4 bg-neutral-950 p-6`}
      >
        <ActionList projectID={projectIDNum} selectedActionID={actionIDNum} />
      </div>

      <div className="w-full bg-neutral-950 p-6 pl-10">
        <ActionOverview action={findActionQuery.data.data} />
      </div>
    </>
  )
}
