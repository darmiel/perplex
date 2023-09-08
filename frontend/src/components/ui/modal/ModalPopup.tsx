import { ReactNode } from "react"
import Popup from "reactjs-popup"

export default function ModalPopup({
  open,
  setOpen,
  children,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  children: ReactNode
}) {
  return (
    <Popup
      modal
      contentStyle={{
        background: "none",
        border: "none",
        width: "fit-content",
      }}
      overlayStyle={{
        backgroundColor: "rgba(0, 0, 0, 0.8)",
      }}
      open={open}
      onClose={() => setOpen(false)}
      closeOnDocumentClick={false}
      closeOnEscape={true}
    >
      {children}
    </Popup>
  )
}
