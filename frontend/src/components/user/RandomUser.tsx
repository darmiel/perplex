import { User } from "@/api/types"

export default function RandomUserPicker({
  users,
  count = 1,
  callback,
}: {
  users: User[]
  count: number
  callback: (users: User[]) => void
}) {
  function start() {
    // interval that delay increases over time
  }

  return (
    <div
      className={`space-y-6 rounded-md border border-neutral-800 bg-neutral-950 p-4`}
    >
      <h1 className="text-xl font-semibold">Random Picker ({count}x)</h1>
    </div>
  )
}
