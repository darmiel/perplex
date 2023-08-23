import MeetingOverview from "@/components/meeting/MeetingList"
import { useRouter } from "next/router"

export default function ProjectPage() {
  const router = useRouter()
  const { project_id: projectID } = router.query
  return (
    <div className="flex-none w-full bg-neutral-900 p-6 border-x border-neutral-700 space-y-4">
      <MeetingOverview projectID={String(projectID)} router={router} />
    </div>
  )
}
