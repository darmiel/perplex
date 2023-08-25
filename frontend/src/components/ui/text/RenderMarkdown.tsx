import "github-markdown-css"

import { ReactMarkdown } from "react-markdown/lib/react-markdown"
import { Prism } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism"
import remarkGfm from "remark-gfm"

export default function RenderMarkdown({
  markdown,
  className = "",
}: {
  markdown: string
  className?: string
}) {
  const props = { children: markdown, remarkPlugins: [remarkGfm] }
  const prismProps = (children: any, lang: string) => {
    return {
      children: String(children).replace(/\n$/, ""),
      language: lang,
      style: oneDark,
    }
  }
  return (
    <div className={`markdown-body ${className}`}>
      <ReactMarkdown
        {...props}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "")
            return !inline && match ? (
              <Prism {...prismProps(children, match[1])} />
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            )
          },
        }}
      />
    </div>
  )
}
