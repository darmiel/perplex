import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import Comment from "../comment/Comment"

type CommentType = {
  author: string
  content: string
  date: string
  solution?: boolean
}

export default function TopicOverview({
  type,
  title,
  description,
}: {
  type: string
  title: string
  description: string
}) {
  const [commentBoxText, setCommentBoxText] = useState("")
  const [comments, setComments] = useState<CommentType[]>([])

  return (
    <div className="flex flex-col">
      <span className="uppercase text-xs text-purple-500">{type}</span>
      <h1 className="text-2xl font-bold">{title}</h1>
      <span className="text-neutral-500 my-3">
        <ReactMarkdown
          children={description}
          remarkPlugins={[remarkGfm]}
        ></ReactMarkdown>
      </span>

      <div className="relative mt-4 border-t border-gray-700">
        <textarea
          className="mt-8 w-full px-3 py-2 bg-neutral-900 border border-neutral-700"
          placeholder="Write a comment..."
          rows={4}
          onChange={(e) => setCommentBoxText(e.target.value)}
          value={commentBoxText}
        ></textarea>
        <button
          className="absolute bottom-6 right-4 bg-purple-600 text-white py-2 px-4 rounded"
          onClick={() => {
            setComments((old) => [
              ...old,
              {
                author: "Daniel",
                content: commentBoxText,
                date: new Date().toISOString(),
                solution: false,
              },
            ])
            setCommentBoxText("")
          }}
        >
          Comment
        </button>
      </div>

      <div>
        {comments.map((c, index) => (
          <Comment
            key={index}
            author={c.author}
            time={c.date}
            message={c.content}
            solution={c.solution}
          />
        ))}
      </div>
    </div>
  )
}
