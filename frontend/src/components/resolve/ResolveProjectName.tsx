import { useAuth } from "@/contexts/AuthContext"

export default function ResolveProjectName({
  projectID,
}: {
  projectID: number
}) {
  const { projects } = useAuth()
  const userResolveQuery = projects!.useFind(projectID)
  if (userResolveQuery.isLoading) {
    return <>Loading Project</>
  }
  if (userResolveQuery.isError) {
    return <>Unknown Project</>
  }
  return <>{userResolveQuery.data.data.name}</>
}
