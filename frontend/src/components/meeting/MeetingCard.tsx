import SimpleCard from "@/components/controls/card/SimpleCard"

export default function MeetingCard({
  title,
  date,
  active,
  onClick,
}: {
  title: string
  date: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <SimpleCard
      title={title}
      subtitle={date}
      active={active}
      onClick={onClick}
    />
  )
}
