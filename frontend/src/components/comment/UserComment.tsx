import RenderMarkdown from "@/components/text/RenderMarkdown"
import UserAvatar from "@/components/user/UserAvatar"

export default function UserComment({
  author,
  time,
  message,
  solution,
  onSolutionClick,
}: {
  author: string
  time: string
  message: string
  solution?: boolean
  onSolutionClick?: () => void
}) {
  const d = new Date(Date.parse(time))
  return (
    <div
      className={`flex mt-8 ${
        solution
          ? "border-l-4 border-purple-600 bg-purple-500 bg-opacity-20 pl-3 py-3"
          : ""
      }`}
    >
      <div>
        <UserAvatar userID={author} />
      </div>
      <div className="flex flex-col ml-3">
        <div>
          <span className="font-semibold">{author}</span>
          <span className="text-neutral-500"> - {d.toLocaleTimeString()}</span>
        </div>
        <div className="mt-4 text-neutral-200">
          <RenderMarkdown markdown={message} />
        </div>
      </div>
      <div
        className="ml-auto mr-4 text-purple-500 underline cursor-pointer"
        onClick={() => onSolutionClick?.()}
      >
        {solution ? "Remove Solution" : "Mark Solution"}
      </div>
    </div>
  )
}
