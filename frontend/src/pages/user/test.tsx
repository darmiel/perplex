import CreateMeetingModal from "@/components/meeting/modals/CreateMeetingModal"

export default function TestPage() {
  return (
    <div className="flex w-full items-center justify-center p-10">
      <CreateMeetingModal projectID={7} onClose={() => {}} />
    </div>
  )
}
