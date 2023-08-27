import { useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useRouter } from "next/router"

import { Action, BackendResponse } from "@/api/types"
import { extractErrorMessage } from "@/api/util"
import ActionList from "@/components/action/ActionList"
import ActionOverview from "@/components/action/ActionOverview"
import { useAuth } from "@/contexts/AuthContext"

export default function ActionPage() {
  const router = useRouter()
  const { project_id: projectID, action_id: actionID } = router.query

  const { axios } = useAuth()

  const findActionQuery = useQuery<BackendResponse<Action>, AxiosError>({
    queryKey: [{ actionID }],
    queryFn: async () =>
      (await axios!.get(`/project/${projectID}/action/${actionID}`)).data,
    enabled: !!projectID && !!actionID,
  })

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
      <div className="flex-initial w-[30rem] bg-neutral-950 p-6 border-x border-neutral-700 space-y-4">
        <ActionList projectID={projectIDNum} selectedActionID={actionIDNum} />
      </div>

      <div className="w-full bg-neutral-950 p-6 pl-10">
        <ActionOverview action={findActionQuery.data.data} />
      </div>
    </>
  )
}
