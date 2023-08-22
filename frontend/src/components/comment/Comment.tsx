import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export default function Comment({
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
        <img
          src={`https://api.dicebear.com/6.x/bottts-neutral/svg?seed=${author}`}
          alt="Avatar"
          className="w-10 h-10 mt-1 rounded-full"
        />
      </div>
      <div className="flex flex-col ml-3">
        <div>
          <span className="font-semibold">{author}</span>
          <span className="text-neutral-500"> - {d.toLocaleTimeString()}</span>
        </div>
        <div className="mt-1 text-neutral-200">
          <ReactMarkdown
            children={message}
            remarkPlugins={[remarkGfm]}
          ></ReactMarkdown>
        </div>
      </div>
      <div
        className="ml-auto mr-4 text-purple-500 underline cursor-pointer"
        onClick={() => onSolutionClick && onSolutionClick()}
      >
        {solution ? "Remove Solution" : "Mark Solution"}
      </div>
    </div>
  )
}
