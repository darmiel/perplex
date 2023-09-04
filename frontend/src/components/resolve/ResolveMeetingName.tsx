import { useAuth } from "@/contexts/AuthContext"

export default function ResolveMeetingName({
  projectID,
  meetingID,
}: {
  projectID: number
  meetingID: number
}) {
  const { meetings } = useAuth()
  const meetingResolveQuery = meetings!.useFind(projectID, meetingID)
  if (meetingResolveQuery.isLoading) {
    return <>Loading Meeting</>
  }
  if (meetingResolveQuery.isError) {
    return <>Unknown Meeting</>
  }
  return <>{meetingResolveQuery.data.data.name}</>
}
