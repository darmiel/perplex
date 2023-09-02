export default function BadgeHeader({
  title,
  badge,
  badgeColors = "bg-neutral-700 text-white",
}: {
  title: string
  badge: any
  badgeColors?: string
}) {
  return (
    <h1 className="font-semibold text-xl flex items-center space-x-2">
      <span>{title}</span>
      <div
        className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold ${badgeColors} rounded-full`}
      >
        {badge}
      </div>
    </h1>
  )
}
