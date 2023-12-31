import CreateMeetingModal from "@/components/meeting/modals/CreateMeetingModal"

export default function TestPage() {
  return (
    <div className="flex">
      <CreateMeetingModal projectID={7} onClose={() => {}} />
    </div>
  )
}
