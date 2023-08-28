import { ReactNode } from "react"
import { BsX } from "react-icons/bs"
import { ClipLoader } from "react-spinners"

export default function Removable({
  loading = false,
  onRemove,
  children,
}: {
  loading?: boolean
  children: ReactNode
  onRemove?: () => void
}) {
  return (
    <div className="flex justify-between items-center space-x-2">
      {children}
      <div
        className="cursor-pointer"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          !loading && onRemove?.()
        }}
      >
        {loading ? <ClipLoader color="orange" size="1em" /> : <BsX />}
      </div>
    </div>
  )
}
